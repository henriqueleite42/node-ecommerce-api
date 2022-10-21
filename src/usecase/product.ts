import type { QueueManager } from "../adapters/queue-manager";
import type { TopicManager } from "../adapters/topic-manager";
import type { CounterRepository } from "../models/counter";
import type {
	CreateInput,
	EditInput,
	GetProductsByTypeInput,
	ProductRepository,
	ProductUseCase,
	GetByIdInput,
	UpdateImgInput,
	IncreaseSalesCountInput,
	IncreaseTotalBilledInput,
	DeleteInput,
	ProductDeletedMessage,
	GetUrlToUploadImgInput,
	DelayProductCreatedNotificationMessage,
	ProductCreatedMessage,
	IncreaseMediaCountInput,
} from "../models/product";
import type { StoreUseCase } from "../models/store";
import type { UploadManager } from "../providers/upload-manager";

import { CustomError } from "../utils/error";

import { isAutomaticDelivery } from "../types/enums/delivery-method";
import { MediaTypeEnum } from "../types/enums/media-type";
import { isLiveProduct, ProductTypeEnum } from "../types/enums/product-type";
import { StatusCodeEnum } from "../types/enums/status-code";

export class ProductUseCaseImplementation implements ProductUseCase {
	public constructor(
		private readonly productRepository: ProductRepository,
		private readonly counterRepository: CounterRepository,
		private readonly uploadManager: UploadManager,
		private readonly queueManager: QueueManager,
		private readonly topicManager: TopicManager,

		private readonly storeUsecase: StoreUseCase,
	) {}

	public async create(p: CreateInput) {
		const { storeId, variations, price, type, deliveryMethod } = p;

		const store = await this.storeUsecase.getById({ storeId }).catch();

		if (!store) {
			throw new CustomError("Store not found", StatusCodeEnum.NOT_FOUND);
		}

		if (!store.verified) {
			throw new CustomError(
				"Store must be verified to create products",
				StatusCodeEnum.FORBIDDEN,
			);
		}

		if (variations && price) {
			throw new CustomError(
				"The product cannot have a price if it has variations",
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		if (isLiveProduct(type) && isAutomaticDelivery(deliveryMethod)) {
			throw new CustomError(
				"A live product cannot have an automatic delivery method",
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		const product = await this.productRepository.create(p);

		await this.queueManager.sendMsg<DelayProductCreatedNotificationMessage>({
			to: process.env.PRODUCT_DELAY_PRODUCT_CREATION_NOTIFICATION_QUEUE_URL!,
			message: {
				storeId,
				productId: product.productId,
				type: product.type,
				createdAt: product.createdAt.toString(),
			},
			delayInSeconds: 900, // 15 min
		});

		return product;
	}

	public async processDelayedCreatedNotification({
		storeId,
		productId,
		type,
		createdAt,
	}: DelayProductCreatedNotificationMessage) {
		if (type === ProductTypeEnum.PACK) {
			const delayForPackProducts = // 30 min after creation
				// eslint-disable-next-line @typescript-eslint/no-magic-numbers
				new Date(createdAt).getTime() + 1000 * 60 * 30;
			const now = new Date().getTime();

			/**
			 * We give 30min for products of type PACK, so the
			 * creator can have time to create all the contents of the pack
			 * before we notify it's creation.
			 *
			 * As the limit of SQS is 15min of delay, we have to
			 * create this workaround.
			 */
			if (now < delayForPackProducts) {
				await this.queueManager.sendMsg<DelayProductCreatedNotificationMessage>(
					{
						to: process.env
							.PRODUCT_DELAY_PRODUCT_CREATION_NOTIFICATION_QUEUE_URL!,
						message: {
							storeId,
							productId,
							type,
							createdAt,
						},
						delayInSeconds: 900, // 15 min
					},
				);

				return;
			}
		}

		/**
		 * We need to get the product again, because if type = PACK,
		 * the product will be updated with the media count
		 */
		const product = await this.productRepository.getById({
			storeId,
			productId,
		});

		// In case of the product being deleted in the meantime
		if (!product) return;

		await this.topicManager.sendMsg<ProductCreatedMessage>({
			to: process.env.PRODUCT_PRODUCT_CREATED_TOPIC_ARN!,
			message: product,
		});
	}

	public async edit(p: EditInput) {
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
		if (Object.keys(p).length === 2) {
			throw new CustomError("Nothing to edit", StatusCodeEnum.BAD_REQUEST);
		}

		const product = await this.productRepository.edit(p);

		if (!product) {
			throw new CustomError("Not found", StatusCodeEnum.NOT_FOUND);
		}

		return product;
	}

	public increaseMediaCount(p: IncreaseMediaCountInput) {
		return this.productRepository.increaseMediaCount(p);
	}

	public getUrlToUploadImg({ storeId, productId }: GetUrlToUploadImgInput) {
		return this.uploadManager.getUrlToUpload({
			folder: process.env.PRODUCT_MEDIA_BUCKET_NAME!,
			fileName: `${storeId}/${productId}`,
			type: MediaTypeEnum.IMAGE,
		});
	}

	public async delete(p: DeleteInput) {
		const product = await this.productRepository.getById(p);

		if (!product) {
			throw new CustomError("Not found", StatusCodeEnum.NOT_FOUND);
		}

		await this.productRepository.delete(p);

		await this.topicManager.sendMsg<ProductDeletedMessage>({
			to: process.env.PRODUCT_PRODUCT_DELETED_TOPIC_ARN!,
			message: product,
		});
	}

	public getProductsByType(p: GetProductsByTypeInput) {
		return this.productRepository.getProductsByType(p);
	}

	public async getById(p: GetByIdInput) {
		const product = await this.productRepository.getById(p);

		if (!product) {
			throw new CustomError("Not found", StatusCodeEnum.NOT_FOUND);
		}

		return product;
	}

	public async getTop() {
		const topProducts = await this.counterRepository.getTopProducts();

		if (topProducts.length === 0) {
			return [];
		}

		return this.productRepository.getManyById(topProducts);
	}

	public async getProductsCount() {
		const count = await this.counterRepository.getTotal("PRODUCTS");

		return {
			total: count,
		};
	}

	public async updateImg({ storeId, productId, imageUrl }: UpdateImgInput) {
		await this.productRepository.edit({
			storeId,
			productId,
			imageUrl,
		});
	}

	public async increaseProductsCount() {
		await this.counterRepository.incrementTotal("PRODUCTS");
	}

	public async increaseSalesCount({
		storeId,
		productId,
	}: IncreaseSalesCountInput) {
		await this.counterRepository.incrementProduct({
			storeId,
			productId,
			qtd: 1,
			type: "TOTAL_BILLED",
		});
	}

	public async increaseTotalBilled({
		storeId,
		productId,
		amount,
	}: IncreaseTotalBilledInput) {
		await this.counterRepository.incrementProduct({
			storeId,
			productId,
			qtd: amount,
			type: "TOTAL_BILLED",
		});
	}
}
