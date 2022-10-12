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
	ProductCreatedMessage,
	ProductDeletedMessage,
	GetUrlToUploadImgInput,
} from "../models/product";
import type { UploadManager } from "../providers/upload-manager";

import { CustomError } from "../utils/error";

import { isAutomaticDelivery } from "../types/enums/delivery-method";
import { MediaTypeEnum } from "../types/enums/media-type";
import { isPreMadeProduct } from "../types/enums/product-type";
import { StatusCodeEnum } from "../types/enums/status-code";

export class ProductUseCaseImplementation implements ProductUseCase {
	public constructor(
		private readonly productRepository: ProductRepository,
		private readonly counterRepository: CounterRepository,
		private readonly uploadManager: UploadManager,
		private readonly topicManager: TopicManager,
	) {}

	public async create(p: CreateInput) {
		if (p.variations && p.price) {
			throw new CustomError(
				"The product cannot have a prive if it has variations",
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		if (!isPreMadeProduct(p.type) && isAutomaticDelivery(p.deliveryMethod)) {
			throw new CustomError(
				"A custom product cannot have an automatic delivery method",
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		const product = await this.productRepository.create(p);

		await this.topicManager.sendMsg<ProductCreatedMessage>({
			to: process.env.PRODUCT_PRODUCT_CREATED_TOPIC_ARN!,
			message: product,
		});

		return product;
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
