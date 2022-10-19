/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-await-in-loop */
/* eslint-disable sonarjs/no-duplicate-string */

import type { PixManager } from "../adapters/pix-manager";
import type { QueueManager } from "../adapters/queue-manager";
import type { TopicManager } from "../adapters/topic-manager";
import type { AccountRepository } from "../models/account";
import type { BlacklistRepository } from "../models/blacklist";
import type { GiveBuyerAccessToSaleMessage } from "../models/content";
import type { CouponRepository } from "../models/coupon";
import type {
	DiscordNotifySellerCustomProductsSaleMessage,
	DiscordNotifySellerLiveProductsSaleMessage,
	DiscordNotifySellerSaleDeliveryConfirmedMessage,
} from "../models/discord";
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
	SalePaidMessage,
	SaleCreatedMessage,
	SetProductAsDeliveredInput,
	SaleDeliveredMessage,
	SaleExpiredMessage,
	AddCouponInput,
	SaleCoupon,
	SaleDeliveryConfirmedMessage,
} from "../models/sale";

import { CustomError } from "../utils/error";

import { isManualDelivery } from "../types/enums/delivery-method";
import { DiscountTypeEnum } from "../types/enums/discount-type";
import { PaymentMethodEnum } from "../types/enums/payment-method";
import {
	isCustomProduct,
	isLiveProduct,
	isPreMadeProduct,
} from "../types/enums/product-type";
import { SalesStatusEnum } from "../types/enums/sale-status";
import { StatusCodeEnum } from "../types/enums/status-code";

export class SaleUseCaseImplementation implements SaleUseCase {
	public constructor(
		private readonly saleRepository: SaleRepository,
		private readonly blacklistRepository: BlacklistRepository,
		private readonly productRepository: ProductRepository,
		private readonly couponRepository: CouponRepository,
		private readonly accountRepository: AccountRepository,
		private readonly topicManager: TopicManager,
		private readonly queueManager: QueueManager,
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

			if (data.buyerMessage && !isCustomProduct(product.type)) {
				throw new CustomError(
					"You only can send messages in custom-made products",
					StatusCodeEnum.BAD_REQUEST,
				);
			}
			if (!data.buyerMessage && isCustomProduct(product.type)) {
				throw new CustomError(
					"A message is required in custom-made products",
					StatusCodeEnum.BAD_REQUEST,
				);
			}

			return this.productToSaleProduct(product, data);
		});

		const originalValue = saleProducts.reduce((acc, cur) => {
			return acc + cur.originalPrice;
		}, 0);

		const sale = await this.saleRepository.create({
			...i,
			originalValue,
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

		if (product.buyerMessage && !isCustomProduct(productData.type)) {
			throw new CustomError(
				"You only can send messages in custom-made products",
				StatusCodeEnum.BAD_REQUEST,
			);
		}
		if (!product.buyerMessage && isCustomProduct(productData.type)) {
			throw new CustomError(
				"A message is required in custom-made products",
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		const newProduct = this.productToSaleProduct(productData, product);

		const { originalValue, finalValue, products } = this.getProductsAndValues(
			[...sale.products, newProduct],
			sale.coupon,
		);

		return this.saleRepository.edit({
			saleId,
			originalValue,
			finalValue,
			products,
		}) as Promise<SaleEntity>;
	}

	// eslint-disable-next-line sonarjs/cognitive-complexity
	public async addCoupon({
		clientId,
		saleId,
		coupon: couponCode,
	}: AddCouponInput) {
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

		const couponData = await this.couponRepository.get({
			storeId: sale.storeId,
			code: couponCode,
		});

		if (!couponData) {
			throw new CustomError("Coupon not found", StatusCodeEnum.NOT_FOUND);
		}

		if (
			couponData.validations?.validAfter &&
			new Date().getTime() < couponData.validations.validAfter.getTime()
		) {
			throw new CustomError("Coupon not valid yet", StatusCodeEnum.CONFLICT);
		}

		if (
			couponData.validations?.expiresAt &&
			new Date().getTime() > couponData.validations.expiresAt.getTime()
		) {
			throw new CustomError("Coupon expired", StatusCodeEnum.CONFLICT);
		}

		if (
			couponData.validations?.clientsIds &&
			!couponData.validations.clientsIds.includes(clientId)
		) {
			throw new CustomError(
				"Client cannot use this coupon",
				StatusCodeEnum.CONFLICT,
			);
		}

		if (
			couponData.validations?.productsIds &&
			!couponData.validations.productsIds.some(pId =>
				sale.products.find(p => p.productId === pId),
			)
		) {
			throw new CustomError(
				"Coupon depends on products that aren't in the cart",
				StatusCodeEnum.CONFLICT,
			);
		}

		if (
			couponData.validations?.productsTypes &&
			!couponData.validations.productsTypes.some(pType =>
				sale.products.find(p => p.type === pType),
			)
		) {
			throw new CustomError(
				"Coupon depends on product type that aren't in the cart",
				StatusCodeEnum.CONFLICT,
			);
		}

		if (
			couponData.validations?.usesLimit &&
			couponData.usesCount >= couponData.validations.usesLimit
		) {
			throw new CustomError("Coupon uses exceeded", StatusCodeEnum.CONFLICT);
		}

		if (couponData.validations?.onlyOnUserFirstStorePurchase) {
			const previousSales = await this.saleRepository.getByStoreIdClientId({
				storeId: sale.storeId,
				clientId: sale.clientId,
				limit: 100,
			});

			const previousSaleCompleted = previousSales.items.find(
				s => s.status === SalesStatusEnum.DELIVERED,
			);

			if (previousSaleCompleted) {
				throw new CustomError(
					"Only valid on the first store purchase",
					StatusCodeEnum.CONFLICT,
				);
			}
		}

		if (couponData.validations?.onlyOnUserFirstGlobalPurchase) {
			const previousSales = await this.saleRepository.getByClientIdStatus({
				clientId: sale.clientId,
				status: SalesStatusEnum.DELIVERED,
				limit: 1,
			});

			if (previousSales.items.length === 1) {
				throw new CustomError(
					"Only valid on the first purchase",
					StatusCodeEnum.CONFLICT,
				);
			}
		}

		if (couponData.validations?.onlyOnePerUser) {
			const previousSales = await this.saleRepository.getByStoreIdClientId({
				storeId: sale.storeId,
				clientId: sale.clientId,
				limit: 100,
			});

			const purchaseWithCoupon = previousSales.items.find(
				p => p.coupon?.code === couponCode,
			);

			if (purchaseWithCoupon) {
				throw new CustomError(
					"User can only use this coupon once",
					StatusCodeEnum.CONFLICT,
				);
			}
		}

		const coupon = {
			code: couponData.code,
			discountType: couponData.discountType,
			amount: couponData.amount,
		};

		const { originalValue, finalValue, products } = this.getProductsAndValues(
			sale.products,
			sale.coupon,
		);

		return this.saleRepository.edit({
			saleId,
			coupon,
			products,
			originalValue,
			finalValue,
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
						value: sale.finalValue!,
					}),
					finalValue: sale.finalValue!,
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

		if (value !== sale.finalValue) {
			/**
			 * We should handle refund here!
			 */

			throw new CustomError("Invalid value paid", StatusCodeEnum.BAD_REQUEST);
		}

		await this.saleRepository.edit({
			saleId,
			status: SalesStatusEnum.PAID,
		});

		await this.topicManager.sendMsg<SalePaidMessage>({
			to: process.env.SALE_SALE_PAID_TOPIC_ARN!,
			message: sale,
			metadata: {
				origin: sale.origin,
			},
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
			if (sale.products.every(p => isPreMadeProduct(p.type))) {
				await this.saleRepository.edit({
					saleId,
					status: SalesStatusEnum.DELIVERY_CONFIRMED,
				});

				await this.topicManager.sendMsg<SaleDeliveredMessage>({
					to: process.env.SALE_SALE_DELIVERY_CONFIRMED_TOPIC_ARN!,
					message: sale,
				});
			} else {
				await this.saleRepository.edit({
					saleId,
					status: SalesStatusEnum.DELIVERED,
				});

				await this.topicManager.sendMsg<SaleDeliveredMessage>({
					to: process.env.SALE_SALE_DELIVERED_TOPIC_ARN!,
					message: sale,
				});
			}
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

	public async handleSaleDelivery(sale: SalePaidMessage) {
		const hasPreMadeProducts = sale.products.some(p =>
			isPreMadeProduct(p.type),
		);
		const hasCustomMadeProducts = sale.products.some(p =>
			isCustomProduct(p.type),
		);
		const hasLiveProducts = sale.products.some(p => isLiveProduct(p.type));

		if (hasPreMadeProducts) {
			await this.queueManager.sendMsg<GiveBuyerAccessToSaleMessage>({
				to: process.env.CONTENT_GIVE_BUYER_ACCESS_TO_SALE_PRODUCTS!,
				message: sale,
			});
		}

		const sellerAccount = await this.accountRepository.getByAccountId(
			sale.storeId,
		);

		if (!sellerAccount) return;

		if (hasCustomMadeProducts) {
			await this.queueManager.sendMsg<DiscordNotifySellerCustomProductsSaleMessage>(
				{
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					to: process.env[
						`${sellerAccount?.notifyThrough}_NOTIFY_SELLER_CUSTOM_PRODUCTS_SALE`
					]!,
					message: {
						sale,
						accountId: sellerAccount.accountId,
						discordId: sellerAccount.discordId!,
					},
				},
			);
		}

		if (hasLiveProducts) {
			await this.queueManager.sendMsg<DiscordNotifySellerLiveProductsSaleMessage>(
				{
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					to: process.env[
						`${sellerAccount?.notifyThrough}_NOTIFY_SELLER_LIVE_PRODUCTS_SALE`
					]!,
					message: {
						sale,
						accountId: sellerAccount.accountId,
						discordId: sellerAccount.discordId!,
					},
				},
			);
		}
	}

	public async notifySellerSaleDelivered(sale: SaleDeliveryConfirmedMessage) {
		const sellerAccount = await this.accountRepository.getByAccountId(
			sale.storeId,
		);

		if (!sellerAccount) return;

		await this.queueManager.sendMsg<DiscordNotifySellerSaleDeliveryConfirmedMessage>(
			{
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				to: process.env[
					`${sellerAccount?.notifyThrough}_NOTIFY_SELLER_SALE_DELIVERY_CONFIRMED`
				]!,
				message: {
					sale,
					accountId: sellerAccount.accountId,
					discordId: sellerAccount.discordId!,
				},
			},
		);
	}

	// Internal Methods

	private productToSaleProduct(
		product: ProductEntity,
		{ productId, variationId, buyerMessage }: AddProductSaleInput["product"],
	): SaleProduct {
		if (product.variations && product.variations.length > 0 && !variationId) {
			throw new CustomError("Missing variation", StatusCodeEnum.BAD_REQUEST);
		}

		const price =
			product.variations?.find(v => v.id === variationId)?.price ||
			product.price ||
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			0.1;

		return {
			productId,
			type: product.type,
			name: product.name,
			description: product.description,
			originalPrice: price,
			imageUrl: product.imageUrl,
			deliveryMethod: product.deliveryMethod,
			buyerMessage,
		};
	}

	private roundMoney(value: number) {
		return parseFloat(value.toFixed(2));
	}

	private applyDiscount(value: number, coupon?: SaleCoupon) {
		if (!coupon) return value;

		if (coupon.discountType === DiscountTypeEnum.RAW_VALUE) {
			const discount = value - coupon.amount;

			if (discount < 0.01) return 0.01;

			return discount;
		}

		const toSub = this.roundMoney((value * coupon.amount) / 100);

		return this.roundMoney(value - toSub);
	}

	private getProductsAndValues(
		products: Array<SaleProduct>,
		coupon?: SaleCoupon,
	) {
		let originalValue = 0;
		let finalValue = 0;
		const productsFormatted = products.map(p => {
			const productFinalValue = this.applyDiscount(p.originalPrice, coupon);

			originalValue += p.originalPrice;
			finalValue += productFinalValue;

			return {
				...p,
				originalPrice: p.originalPrice,
				finalPrice: productFinalValue,
			};
		});

		return {
			originalValue,
			finalValue,
			products: productsFormatted,
		};
	}
}
