import type {
	ContentRepository,
	ContentUseCase,
	CreateManyWithUrlInput,
	EditInput,
	GetUrlToUploadRawImgInput,
} from "../models/content";
import type { UploadManager } from "../providers/upload-manager";

export class ContentUseCaseImplementation implements ContentUseCase {
	public constructor(
		private readonly contentRepository: ContentRepository,
		private readonly uploadManager: UploadManager,
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

	public getUrlToUploadRawImg({
		storeId,
		productId,
		contentId,
		type,
	}: GetUrlToUploadRawImgInput) {
		return this.uploadManager.getUrlToUpload({
			folder: process.env.CONTENT_RAW_MEDIA_BUCKET_NAME!,
			fileName: `${storeId}/${productId}/${contentId}`,
			type,
		});
	}

	public edit(p: EditInput) {
		return this.contentRepository.edit(p);
	}
}
