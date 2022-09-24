import type { ContentUseCase } from "models/content";
import type { CounterRepository } from "models/counters";
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
} from "models/product";
import type { UploadManager } from "providers/upload-manager";

import { isAutomaticDelivery } from "types/enums/delivery-method";
import { MediaTypeEnum } from "types/enums/media-type";
import { isPreMadeProduct } from "types/enums/product-type";

export class ProductUseCaseImplementation implements ProductUseCase {
	public constructor(
		private readonly productRepository: ProductRepository,
		private readonly counterRepository: CounterRepository,
		private readonly contentUseCase: ContentUseCase,
		private readonly uploadManager: UploadManager,
	) {}

	public async create({ imageUrl, ...p }: CreateProductInput) {
		if (p.variations && p.price) {
			throw new Error("PRICE_CONFLICT");
		}

		if (!isPreMadeProduct(p.type) && isAutomaticDelivery(p.deliveryMethod)) {
			throw new Error("INVALID_DELIVERY_METHOD");
		}

		const product = await this.productRepository.create(p);

		if (imageUrl) {
			await this.uploadManager.uploadFromUrl({
				queueToNotify: "",
				type: "PRODUCT",
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
			throw new Error("NOT_FOUND");
		}

		if (imageUrl) {
			await this.uploadManager.uploadFromUrlBackground({
				queueToNotify: "",
				type: "PRODUCT",
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

	public getProductsByType(p: GetProductsByTypeInput) {
		return this.productRepository.getProductsByType(p);
	}

	public async getById(p: GetByIdInput) {
		const store = await this.productRepository.getById(p);

		if (!store) {
			throw new Error("NOT_FOUND");
		}

		return store;
	}

	public async getTop() {
		const topProducts = await this.counterRepository.getTopProducts();

		return this.productRepository.getManyById(topProducts);
	}

	public async updateImg({ storeId, productId, imageUrl }: UpdateImgInput) {
		await this.productRepository.edit({
			storeId,
			productId,
			imageUrl,
		});
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
