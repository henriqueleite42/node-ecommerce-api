/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-await-in-loop */
/* eslint-disable sonarjs/no-duplicate-string */

import type { PixManager } from "../adapters/pix-manager";
import type { TopicManager } from "../adapters/topic-manager";
import type { BlacklistRepository } from "../models/blacklist";
import type { ProductEntity, ProductRepository } from "../models/product";
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
	PaymentProcessedMessage,
	SaleCreatedMessage,
	SetProductAsDeliveredInput,
	SaleDeliveredMessage,
	SaleExpiredMessage,
} from "../models/sale";

import { CustomError } from "../utils/error";

import { isManualDelivery } from "../types/enums/delivery-method";
import { PaymentMethodEnum } from "../types/enums/payment-method";
import { SalesStatusEnum } from "../types/enums/sale-status";
import { StatusCodeEnum } from "../types/enums/status-code";

export class SaleUseCaseImplementation implements SaleUseCase {
	public constructor(
		private readonly saleRepository: SaleRepository,
		private readonly blacklistRepository: BlacklistRepository,
		private readonly productRepository: ProductRepository,
		private readonly topicManager: TopicManager,
		private readonly pixManager: PixManager,
	) {}

	public async create({ products, ...i }: CreateSaleInput) {
		const { buying } = await this.blacklistRepository.get({
			accountId: i.clientId,
		});

		if (buying) {
			throw new CustomError("User blacklisted", StatusCodeEnum.FORBIDDEN);
		}

		const productsData = await this.productRepository.getManyById(
			products.map(p => ({
				storeId: i.storeId,
				productId: p.productId,
			})),
		);

		if (productsData.length !== products.length) {
			throw new CustomError("Product not found", StatusCodeEnum.NOT_FOUND);
		}

		const saleProducts = productsData.map(product => {
			const data = products.find(p => p.productId === product.productId)!;

			return this.productToSaleProduct(product, data);
		});

		const sale = await this.saleRepository.create({
			...i,
			products: saleProducts,
		});

		await this.topicManager.sendMsg<SaleCreatedMessage>({
			to: process.env.SALE_SALE_CREATED_TOPIC_ARN!,
			message: sale,
		});

		return sale;
	}

	public async addProduct({ clientId, saleId, product }: AddProductSaleInput) {
		const sale = await this.saleRepository.getById({ saleId });

		if (!sale) {
			throw new CustomError("Sale not found", StatusCodeEnum.NOT_FOUND);
		}

		if (sale.clientId !== clientId) {
			throw new CustomError("Unauthorized", StatusCodeEnum.UNAUTHORIZED);
		}

		if (sale.status !== SalesStatusEnum.IN_CART) {
			throw new CustomError(
				"Sale already in progress",
				StatusCodeEnum.CONFLICT,
			);
		}

		const productAlreadyExists = sale.products.find(
			p =>
				p.productId === product.productId &&
				p.variationId === product.variationId,
		);

		if (productAlreadyExists) {
			throw new CustomError("Product already in cart", StatusCodeEnum.CONFLICT);
		}

		const productData = await this.productRepository.getById({
			storeId: sale.storeId,
			productId: product.productId,
		});

		if (!productData) {
			throw new CustomError("Product not found", StatusCodeEnum.NOT_FOUND);
		}

		return this.saleRepository.edit({
			saleId,
			products: [
				...sale.products,
				this.productToSaleProduct(productData, product),
			],
		}) as Promise<SaleEntity>;
	}

	public async checkout({
		clientId,
		paymentMethod,
		saleId,
	}: CheckoutSaleInput) {
		const sale = await this.saleRepository.getById({ saleId });

		if (!sale) {
			throw new CustomError("Sale not found", StatusCodeEnum.NOT_FOUND);
		}

		if (sale.clientId !== clientId) {
			throw new CustomError("Unauthorized", StatusCodeEnum.UNAUTHORIZED);
		}

		if (sale.status !== SalesStatusEnum.IN_CART) {
			throw new CustomError(
				"Sale already in progress",
				StatusCodeEnum.CONFLICT,
			);
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
				throw new CustomError(
					"Invalid payment method",
					StatusCodeEnum.BAD_REQUEST,
				);
		}
	}

	public async processPixPayment(p: any) {
		const { saleId, value } = this.pixManager.getPixPaidData(p);

		const sale = await this.saleRepository.getById({ saleId });

		if (!sale) {
			throw new CustomError("Sale not found", StatusCodeEnum.NOT_FOUND);
		}

		if (sale.status !== SalesStatusEnum.PENDING) {
			throw new CustomError(
				"Sale already in progress",
				StatusCodeEnum.CONFLICT,
			);
		}

		if (value !== sale.finalPrice) {
			/**
			 * We should handle refund here!
			 */

			throw new CustomError("Invalid value paid", StatusCodeEnum.BAD_REQUEST);
		}

		await this.saleRepository.edit({
			saleId,
			status: SalesStatusEnum.PAID,
		});

		await this.topicManager.sendMsg<PaymentProcessedMessage>({
			to: process.env.SALE_PAYMENT_PROCESSED_TOPIC_ARN!,
			message: sale,
		});
	}

	public async setProductAsDelivered({
		storeId,
		saleId,
		productId,
		variationId,
	}: SetProductAsDeliveredInput) {
		const sale = await this.saleRepository.getById({ saleId });

		if (!sale) {
			throw new CustomError("Sale not found", StatusCodeEnum.NOT_FOUND);
		}

		if (sale.storeId !== storeId) {
			throw new CustomError("Unauthorized", StatusCodeEnum.UNAUTHORIZED);
		}

		if (sale.status !== SalesStatusEnum.PAID) {
			throw new CustomError("Sale status invalid", StatusCodeEnum.CONFLICT);
		}

		const productIndex = sale.products.findIndex(
			p => p.productId === productId && p.variationId === variationId,
		);

		if (productIndex === -1) {
			throw new CustomError("Product not found", StatusCodeEnum.NOT_FOUND);
		}

		const product = sale.products[productIndex];

		if (!isManualDelivery(product.deliveryMethod)) {
			throw new CustomError("Invalid delivery method", StatusCodeEnum.CONFLICT);
		}

		const saleUpdated = await this.saleRepository.editSaleProduct({
			saleId,
			productIndex,
			delivered: true,
		});

		// Adds 1 because of the updated product
		const productsDelivered = sale.products.filter(p => p.delivered).length + 1;

		// If all products of the sale where delivered, we must set the sale as delivered
		if (sale.products.length === productsDelivered) {
			await this.saleRepository.edit({
				saleId,
				status: SalesStatusEnum.DELIVERED,
			});

			await this.topicManager.sendMsg<SaleDeliveredMessage>({
				to: process.env.SALE_SALE_DELIVERED_TOPIC_ARN!,
				message: sale,
			});
		}

		return saleUpdated!;
	}

	public async getById(p: GetByIdInput) {
		const sale = await this.saleRepository.getById(p);

		if (!sale) {
			throw new CustomError("Sale not found", StatusCodeEnum.NOT_FOUND);
		}

		return sale;
	}

	public getByClientIdStatus(p: GetByClientIdStatusInput) {
		return this.saleRepository.getByClientIdStatus(p);
	}

	public getByStoreIdStatus(p: GetByStoreIdStatusInput) {
		return this.saleRepository.getByStoreIdStatus(p);
	}

	public async setExpiredStatus() {
		let cursor: string | undefined;

		do {
			const { items, nextPage } = await this.saleRepository.getExpired({
				continueFrom: cursor,
			});

			if (items.length === 0) {
				return;
			}

			await this.saleRepository.bulkEdit({
				salesIds: items.map(i => i.saleId),
				data: {
					status: SalesStatusEnum.EXPIRED,
				},
			});

			await this.topicManager.sendMsg<SaleExpiredMessage>({
				to: process.env.SALE_SALES_EXPIRED_TOPIC_ARN!,
				message: {
					sales: items,
				},
			});

			cursor = nextPage;
		} while (cursor);
	}

	// Internal Methods

	private productToSaleProduct(
		product: ProductEntity,
		{ productId, variationId }: AddProductSaleInput["product"],
	): SaleProduct {
		if (product.variations && product.variations.length > 0 && !variationId) {
			throw new CustomError("Missing variation", StatusCodeEnum.BAD_REQUEST);
		}

		return {
			productId,
			type: product.type,
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
