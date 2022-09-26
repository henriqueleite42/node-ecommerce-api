import type {
	ContentRepository,
	ContentUseCase,
	CreateManyWithUrlInput,
	EditInput,
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
					queueToNotify: process.env.UPDATE_RAW_IMG_QUEUE_URL!,
					type: "CONTENT",
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

	public edit(p: EditInput) {
		return this.contentRepository.edit(p);
	}
}
