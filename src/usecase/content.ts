/* eslint-disable max-depth */
/* eslint-disable no-await-in-loop */
import type { FileManager } from "../adapters/file-manager";
import type { TopicManager } from "../adapters/topic-manager";
import type {
	AccessContentRepository,
	AccountAccessesStoresRepository,
	CreateManyInput,
} from "../models/access-content";
import type {
	AccessGrantedMessage,
	ContentRepository,
	ContentUseCase,
	CreateManyWithUrlInput,
	EditInput,
	GetContentFileInput,
	GetUrlToUploadRawMediaInput,
	GetUserAccessStoresInput,
} from "../models/content";
import type { SalePaidMessage, SaleProduct } from "../models/sale";
import type { StoreRepository } from "../models/store";
import type { UploadManager } from "../providers/upload-manager";

import { CustomError } from "../utils/error";

import { ProductTypeEnum, isPreMadeProduct } from "../types/enums/product-type";
import { StatusCodeEnum } from "../types/enums/status-code";

export class ContentUseCaseImplementation implements ContentUseCase {
	public constructor(
		private readonly contentRepository: ContentRepository,
		private readonly accessContentRepository: AccessContentRepository,
		private readonly accountAccessesStoresRepository: AccountAccessesStoresRepository,
		private readonly storeRepository: StoreRepository,
		private readonly uploadManager: UploadManager,
		private readonly fileManager: FileManager,
		private readonly topicManager: TopicManager,
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
		const access = await this.accessContentRepository.get({
			accountId,
			storeId,
			productId,
			contentId,
		});

		if (!access?.rawContentPath) {
			throw new CustomError("Not found", StatusCodeEnum.NOT_FOUND);
		}

		const file = await this.fileManager.getFile({
			folder: process.env.CONTENT_RAW_MEDIA_BUCKET_NAME!,
			fileName: access.rawContentPath,
		});

		if (!file) {
			throw new CustomError("Not found", StatusCodeEnum.NOT_FOUND);
		}

		return file;
	}

	public getUserAccessStores(p: GetUserAccessStoresInput) {
		return this.accountAccessesStoresRepository.getList(p);
	}

	// eslint-disable-next-line sonarjs/cognitive-complexity
	public async giveAccessAfterSale({
		saleId,
		clientId,
		storeId,
		products,
		origin,
	}: SalePaidMessage) {
		const packs = [] as Array<SaleProduct>;
		const medias = [] as Array<SaleProduct>;

		products.forEach(p => {
			if (p.type === ProductTypeEnum.PACK) {
				packs.push(p);
			} else if (isPreMadeProduct(p.type)) {
				medias.push(p);
			}
		});

		if (packs.length > 0) {
			for (const pack of packs) {
				let cursor: string | undefined;

				do {
					const { items, nextPage } =
						await this.contentRepository.getFromProduct({
							storeId,
							productId: pack.productId,
							/**
							 * As the limit of BulkWrite from dynamo is 100 items,
							 * we have to limit it to only 99 on the first run,
							 * and to avoid extra complexity, we use 99 on all runs
							 */
							limit: 99,
							cursor,
						});

					if (items.length === 0) {
						break;
					}

					const itemsToCreate = items.map(p => ({
						accountId: clientId,
						storeId,
						productId: pack.productId,
						contentId: p.contentId,
						type: p.type,
						rawContentPath: p.rawContentPath!,
						processedContentPath: p.processedContentPath!,
					})) as CreateManyInput;

					// Only does it on the first time
					if (!cursor) {
						itemsToCreate.push({
							accountId: clientId,
							storeId,
							productId: pack.productId,
							contentId: "ALL",
						});
					}

					await this.accessContentRepository.createMany(itemsToCreate);

					cursor = nextPage;
				} while (cursor);

				await this.topicManager.sendMsg<AccessGrantedMessage>({
					to: process.env.CONTENT_ACCESS_GRANTED!,
					message: {
						saleId,
						clientId,
						storeId,
						product: pack,
					},
					metadata: {
						origin,
					},
				});
			}
		}

		if (medias.length > 0) {
			for (const media of medias) {
				const {
					items: [content],
				} = await this.contentRepository.getFromProduct({
					storeId,
					productId: media.productId,
					limit: 1,
				});

				if (!content) return;

				await this.accessContentRepository.createMany([
					{
						accountId: clientId,
						storeId,
						productId: media.productId,
						contentId: content.contentId,
						type: content.type,
						rawContentPath: content.rawContentPath!,
						processedContentPath: content.processedContentPath!,
					},
				]);

				await this.topicManager.sendMsg<AccessGrantedMessage>({
					to: process.env.CONTENT_ACCESS_GRANTED!,
					message: {
						saleId,
						clientId,
						storeId,
						product: media,
					},
					metadata: {
						origin,
					},
				});
			}
		}

		if (packs.length > 0 || medias.length > 0) {
			const store = await this.storeRepository.getById({
				storeId,
			});

			if (store) {
				await this.accountAccessesStoresRepository.create({
					accountId: clientId,
					storeId,
					storeName: store.name,
					store: {
						color: store.color,
						avatarUrl: store.avatarUrl,
					},
				});
			}
		}
	}
}
