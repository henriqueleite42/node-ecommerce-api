import type { PixManager } from "adapters/pix-manager";
import type { TopicManager } from "adapters/topic-manager";
import type { ProductEntity, ProductRepository } from "models/product";
import type {
	AddProductSaleInput,
	CreateSaleInput,
	GetByClientIdStatusInput,
	GetByIdInput,
	GetByStoreIdStatusInput,
	SaleEntity,
	SaleProduct,
	SaleRepository,
	SaleUseCase,
	CheckoutSaleInput,
	ProcessPaymentSaleInput,
} from "models/sale";

import { PaymentMethodEnum } from "types/enums/payment-method";
import { SalesStatusEnum } from "types/enums/sale-status";

export class SaleUseCaseImplementation implements SaleUseCase {
	public constructor(
		private readonly saleRepository: SaleRepository,
		private readonly productRepository: ProductRepository,
		private readonly topicManager: TopicManager,
		private readonly pixManager: PixManager,
	) {}

	public async create({ products, ...i }: CreateSaleInput) {
		const productsData = await this.productRepository.getManyById(
			products.map(p => ({
				storeId: i.storeId,
				productId: p.productId,
			})),
		);

		if (productsData.length !== products.length) {
			throw new Error("PRODUCT_NOT_FOUND");
		}

		const saleProducts = productsData.map(product => {
			const data = products.find(p => p.productId === product.productId)!;

			return this.productToSaleProduct(product, data);
		});

		const sale = await this.saleRepository.create({
			...i,
			products: saleProducts,
		});

		await this.topicManager.sendMsg({
			to: "",
			message: sale,
		});

		return sale;
	}

	public async addProduct({ saleId, product }: AddProductSaleInput) {
		const sale = await this.saleRepository.getById({ saleId });

		if (!sale) {
			throw new Error("SALE_NOT_FOUND");
		}

		if (sale.status !== SalesStatusEnum.IN_CART) {
			throw new Error("SALE_ALREADY_IN_PROGRESS");
		}

		const productAlreadyExists = sale.products.find(
			p =>
				p.productId === product.productId &&
				p.variationId === product.variationId,
		);

		if (productAlreadyExists) {
			throw new Error("DUPLICATED_PRODUCT");
		}

		const productData = await this.productRepository.getById({
			storeId: sale.storeId,
			productId: product.productId,
		});

		if (!productData) {
			throw new Error("PRODUCT_NOT_FOUND");
		}

		return this.saleRepository.edit({
			saleId,
			products: [
				...sale.products,
				this.productToSaleProduct(productData, product),
			],
		}) as Promise<SaleEntity>;
	}

	public async checkout({ paymentMethod, saleId }: CheckoutSaleInput) {
		const sale = await this.saleRepository.getById({ saleId });

		if (!sale) {
			throw new Error("SALE_NOT_FOUND");
		}

		if (sale.status !== SalesStatusEnum.IN_CART) {
			throw new Error("INVALID_SALE_STATUS");
		}

		await this.saleRepository.edit({
			saleId,
			status: SalesStatusEnum.PENDING,
		});

		switch (paymentMethod) {
			case PaymentMethodEnum.PIX:
				return {
					pixData: await this.pixManager.createPix({
						saleId,
						value: sale.finalPrice,
					}),
				};

			default:
				throw new Error("INVALID_PAYMENT_METHOD");
		}
	}

	public async processPayment({ saleId }: ProcessPaymentSaleInput) {
		const sale = await this.saleRepository.getById({ saleId });

		if (!sale) {
			throw new Error("SALE_NOT_FOUND");
		}

		if (sale.status !== SalesStatusEnum.PENDING) {
			throw new Error("INVALID_SALE_STATUS");
		}

		await this.saleRepository.edit({
			saleId,
			status: SalesStatusEnum.PAID,
		});

		await this.topicManager.sendMsg({
			to: "",
			message: sale,
		});
	}

	public async getById(p: GetByIdInput) {
		const sale = await this.saleRepository.getById(p);

		if (!sale) {
			throw new Error("SALE_NOT_FOUND");
		}

		return sale;
	}

	public getByClientIdStatus(p: GetByClientIdStatusInput) {
		return this.saleRepository.getByClientIdStatus(p);
	}

	public getByStoreIdStatus(p: GetByStoreIdStatusInput) {
		return this.saleRepository.getByStoreIdStatus(p);
	}

	// Internal Methods

	private productToSaleProduct(
		product: ProductEntity,
		{ productId, variationId }: AddProductSaleInput["product"],
	): SaleProduct {
		if (product.variations && product.variations.length > 0 && !variationId) {
			throw new Error("MISSING_VARIATION");
		}

		return {
			productId,
			name: product.name,
			description: product.description,
			price:
				product.variations?.find(v => v.id === variationId)?.price ||
				product.price ||
				// eslint-disable-next-line @typescript-eslint/no-magic-numbers
				0.1,
			imageUrl: product.imageUrl,
			deliveryMethod: product.deliveryMethod,
		};
	}
}
