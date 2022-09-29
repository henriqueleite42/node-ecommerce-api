import type { ContentUseCase } from "../models/content";
import type { CounterRepository } from "../models/counters";
import type {
	CreateProductInput,
	EditInput,
	GetProductsByTypeInput,
	ProductRepository,
	ProductUseCase,
	GetByIdInput,
	UpdateImgInput,
	IncreaseSalesCountInput,
	IncreaseTotalBilledInput,
	DeleteInput,
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
		private readonly contentUseCase: ContentUseCase,
		private readonly uploadManager: UploadManager,
	) {}

	public async create({ imageUrl, ...p }: CreateProductInput) {
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

		if (imageUrl) {
			await this.uploadManager.uploadFromUrl({
				queueToNotify: process.env.UPDATE_IMG_QUEUE_URL!,
				folder: process.env.MEDIA_BUCKET_NAME!,
				fileName: `${p.storeId}/${product.productId}`,
				id: {
					storeId: product.storeId,
					productId: product.productId,
				},
				mediaUrl: imageUrl,
				mediaType: MediaTypeEnum.IMAGE,
			});
		}

		if (p.contents && p.contents.length > 0) {
			await this.contentUseCase.createManyWithUrl({
				productId: product.productId,
				storeId: product.storeId,
				contents: p.contents,
			});
		}

		return product;
	}

	public async edit({ imageUrl, ...p }: EditInput) {
		const product = await (Object.keys(p).length === 0
			? this.productRepository.getById(p)
			: this.productRepository.edit(p));

		if (!product) {
			throw new CustomError("Not found", StatusCodeEnum.NOT_FOUND);
		}

		if (imageUrl) {
			await this.uploadManager.uploadFromUrlBackground({
				queueToNotify: process.env.UPDATE_IMG_QUEUE_URL!,
				folder: process.env.MEDIA_BUCKET_NAME!,
				fileName: `${p.storeId}/${p.productId}`,
				id: {
					storeId: p.storeId,
					productId: p.productId,
				},
				mediaUrl: imageUrl,
				mediaType: MediaTypeEnum.IMAGE,
			});
		}

		return product;
	}

	public delete(p: DeleteInput) {
		return this.productRepository.delete(p);
	}

	public getProductsByType(p: GetProductsByTypeInput) {
		return this.productRepository.getProductsByType(p);
	}

	public async getById(p: GetByIdInput) {
		const store = await this.productRepository.getById(p);

		if (!store) {
			throw new CustomError("Not found", StatusCodeEnum.NOT_FOUND);
		}

		return store;
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
