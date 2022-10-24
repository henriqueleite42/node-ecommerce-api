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
	ContentCreatedMessage,
	ContentRepository,
	ContentUseCase,
	CreateInput,
	GetContentFileInput,
	GetUrlToUploadRawMediaInput,
	GetUserAccessStoresInput,
	GiveBuyerAccessToSaleMessage,
	SetMediaPathInput,
} from "../models/content";
import type { ProductUseCase } from "../models/product";
import type { SaleProduct } from "../models/sale";
import type { StoreRepository } from "../models/store";

import { CustomError } from "../utils/error";

import { ProductTypeEnum, isPreMadeProduct } from "../types/enums/product-type";
import { StatusCodeEnum } from "../types/enums/status-code";

export class ContentUseCaseImplementation implements ContentUseCase {
	public constructor(
		private readonly contentRepository: ContentRepository,
		private readonly accessContentRepository: AccessContentRepository,
		private readonly accountAccessesStoresRepository: AccountAccessesStoresRepository,
		private readonly storeRepository: StoreRepository,
		private readonly fileManager: FileManager,
		private readonly topicManager: TopicManager,

		private readonly productUsecase: ProductUseCase,
	) {}

	public async create({ storeId, productId, type }: CreateInput) {
		const product = await this.productUsecase
			.getById({
				storeId,
				productId,
			})
			.catch();

		if (!product) {
			throw new CustomError("Product not found", StatusCodeEnum.NOT_FOUND);
		}

		return this.contentRepository.create({
			storeId,
			productId,
			type,
		});
	}

	public getUrlToUploadMedia({
		storeId,
		productId,
		contentId,
		type,
	}: GetUrlToUploadRawMediaInput) {
		return this.fileManager.getUrlToUpload({
			folder: process.env.CONTENT_MEDIA_BUCKET_NAME!,
			fileName: `${storeId}/${productId}/${contentId}`,
			type,
		});
	}

	public async setMediaPath({
		storeId,
		productId,
		contentId,
		mediaPath: mediaUrl,
	}: SetMediaPathInput) {
		const product = await this.productUsecase.getById({
			storeId,
			productId,
		});

		if (!product) {
			return;
		}

		const content = await this.contentRepository.edit({
			storeId,
			productId,
			contentId,
			mediaPath: mediaUrl,
		});

		if (!content) {
			return;
		}

		await this.topicManager.sendMsg<ContentCreatedMessage>({
			to: process.env.CONTENT_CONTENT_CREATED_TOPIC_ARN!,
			message: {
				content,
				product,
			},
			metadata: {
				productType: product.type,
			},
		});
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

		if (!access?.mediaPath) {
			throw new CustomError("Not found", StatusCodeEnum.NOT_FOUND);
		}

		const file = await this.fileManager.getFile({
			folder: process.env.CONTENT_MEDIA_BUCKET_NAME!,
			fileName: access.mediaPath,
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
	}: GiveBuyerAccessToSaleMessage) {
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
						mediaPath: p.mediaPath!,
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
						mediaPath: content.mediaPath!,
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
