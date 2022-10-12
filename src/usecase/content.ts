import type { FileManager } from "../adapters/file-manager";
import type { AccessRepository } from "../models/access";
import type {
	ContentRepository,
	ContentUseCase,
	CreateManyWithUrlInput,
	EditInput,
	GetContentFileInput,
	GetUrlToUploadRawMediaInput,
} from "../models/content";
import type { UploadManager } from "../providers/upload-manager";

import { CustomError } from "../utils/error";

import { StatusCodeEnum } from "../types/enums/status-code";

export class ContentUseCaseImplementation implements ContentUseCase {
	public constructor(
		private readonly contentRepository: ContentRepository,
		private readonly accessRepository: AccessRepository,
		private readonly uploadManager: UploadManager,
		private readonly fileManager: FileManager,
	) {}

	public async createManyWithUrl(p: CreateManyWithUrlInput) {
		const contents = await this.contentRepository.createMany(p);

		await Promise.all(
			contents.map((c, idx) =>
				this.uploadManager.uploadFromUrlBackground({
					folder: process.env.CONTENT_RAW_MEDIA_BUCKET_NAME!,
					fileName: `${c.storeId}/${c.productId}/${c.contentId}`,
					id: {
						storeId: c.storeId,
						productId: c.productId,
						contentId: c.contentId,
					},
					mediaUrl: p.contents[idx].mediaUrl,
					mediaType: p.contents[idx].type,
				}),
			),
		);

		return contents;
	}

	public getUrlToUploadRawMedia({
		storeId,
		productId,
		contentId,
		type,
	}: GetUrlToUploadRawMediaInput) {
		return this.uploadManager.getUrlToUpload({
			folder: process.env.CONTENT_RAW_MEDIA_BUCKET_NAME!,
			fileName: `${storeId}/${productId}/${contentId}`,
			type,
		});
	}

	public edit(p: EditInput) {
		return this.contentRepository.edit(p);
	}

	public async getContentFile({
		accountId,
		storeId,
		productId,
		contentId,
	}: GetContentFileInput) {
		const [content, ...accesses] = await Promise.all([
			this.contentRepository.getContent({
				storeId,
				productId,
				contentId,
			}),

			// Access to specific content
			this.accessRepository.get({
				accountId,
				storeId,
				productId,
				contentId,
			}),

			// Access to all contents of a product
			this.accessRepository.get({
				accountId,
				storeId,
				productId,
			}),
		]);

		if (accesses.filter(Boolean).length === 0) {
			throw new CustomError("Forbidden", StatusCodeEnum.FORBIDDEN);
		}

		if (!content?.rawContentPath) {
			throw new CustomError("Not found", StatusCodeEnum.NOT_FOUND);
		}

		const file = await this.fileManager.getFile({
			folder: process.env.CONTENT_RAW_MEDIA_BUCKET_NAME!,
			fileName: content.rawContentPath,
		});

		if (!file) {
			throw new CustomError("Not found", StatusCodeEnum.NOT_FOUND);
		}

		return file;
	}
}
