import type { CreatePixOutput } from "../adapters/pix-manager";

import type { PaginatedItems } from "./types";

import type { DeliveryMethodEnum } from "../types/enums/delivery-method";
import type { DiscountTypeEnum } from "../types/enums/discount-type";
import type { SaleOriginEnum } from "../types/enums/origin";
import type { PaymentMethodEnum } from "../types/enums/payment-method";
import type { ProductTypeEnum } from "../types/enums/product-type";
import type { SalesStatusEnum } from "../types/enums/sale-status";

export interface SaleCoupon {
	code: string;
	discountType: DiscountTypeEnum;
	amount: number;
}

export interface SaleProduct {
	productId: string;
	variationId?: string;
	type: ProductTypeEnum;
	name: string;
	description: string;
	originalPrice: number;
	finalPrice?: number;
	imageUrl?: string;
	deliveryMethod: DeliveryMethodEnum;
	delivered?: boolean;
}

export interface SaleEntity {
	saleId: string;
	storeId: string;
	clientId: string;
	coupon?: SaleCoupon;
	origin: `${SaleOriginEnum}#${string | "PV"}`;
	status: SalesStatusEnum;
	products: Array<SaleProduct>;
	originalValue: number;
	finalValue?: number;
	createdAt: Date;
	expiresAt: Date;
}

/**
 *
 *
 * Repository
 *
 *
 */

export type CreateInput = Omit<
	SaleEntity,
	"createdAt" | "finalPrice" | "saleId" | "status"
>;

export type EditInput = Partial<
	Omit<
		SaleEntity,
		"clientId" | "createdAt" | "finalPrice" | "saleId" | "storeId"
	>
> &
	Pick<SaleEntity, "saleId">;

export interface EditSaleProductInput {
	saleId: string;
	productIndex: number;
	delivered?: boolean;
}

export interface BulkEditInput {
	salesIds: Array<string>;
	data: Partial<Pick<SaleEntity, "clientId" | "origin" | "status" | "storeId">>;
}

export type GetByIdInput = Pick<SaleEntity, "saleId">;

export interface GetByClientIdStatusInput {
	clientId: SaleEntity["clientId"];
	status: SaleEntity["status"];
	limit: number;
	continueFrom?: string;
}

export interface GetByStoreIdStatusInput {
	storeId: SaleEntity["storeId"];
	status: SaleEntity["status"];
	limit: number;
	continueFrom?: string;
}

export interface GetByStoreIdClientInput {
	storeId: SaleEntity["storeId"];
	clientId: SaleEntity["clientId"];
	limit: number;
	continueFrom?: string;
}

export interface GetExpiredInput {
	continueFrom?: string;
}

export interface GetExpiredOutput {
	items: Array<SaleEntity>; // Sales ids
	nextPage?: string;
}

export interface SaleRepository {
	create: (p: CreateInput) => Promise<SaleEntity>;

	edit: (p: EditInput) => Promise<SaleEntity | null>;

	editSaleProduct: (p: EditSaleProductInput) => Promise<SaleEntity | undefined>;

	bulkEdit: (p: BulkEditInput) => Promise<void>;

	getById: (p: GetByIdInput) => Promise<SaleEntity | null>;

	getByClientIdStatus: (
		p: GetByClientIdStatusInput,
	) => Promise<PaginatedItems<SaleEntity>>;

	getByStoreIdStatus: (
		p: GetByStoreIdStatusInput,
	) => Promise<PaginatedItems<SaleEntity>>;

	getByStoreIdClientId: (
		p: GetByStoreIdClientInput,
	) => Promise<PaginatedItems<SaleEntity>>;

	getExpired: (p: GetExpiredInput) => Promise<GetExpiredOutput>;
}

/**
 *
 *
 * Usecase
 *
 *
 */

export interface CreateSaleInput extends Omit<CreateInput, "products"> {
	products: Array<{
		productId: string;
		variationId?: string;
	}>;
}

export interface AddProductSaleInput {
	clientId: string;
	saleId: string;
	product: {
		productId: string;
		variationId?: string;
	};
}

export interface AddCouponInput {
	clientId: string;
	saleId: string;
	coupon: string;
}

export interface CheckoutSaleInput {
	clientId: string;
	saleId: string;
	paymentMethod: PaymentMethodEnum;
}

export interface CheckoutSaleOutput {
	pixData: CreatePixOutput;
}

export interface SetProductAsDeliveredInput {
	storeId: string;
	saleId: string;
	productId: string;
	variationId?: string;
}

export interface SaleUseCase {
	create: (p: CreateSaleInput) => Promise<SaleEntity>;

	addProduct: (p: AddProductSaleInput) => Promise<SaleEntity>;

	addCoupon: (p: AddCouponInput) => Promise<SaleEntity>;

	checkout: (p: CheckoutSaleInput) => Promise<CheckoutSaleOutput>;

	processPixPayment: (p: any) => Promise<void>;

	setProductAsDelivered: (p: SetProductAsDeliveredInput) => Promise<SaleEntity>;

	getById: (p: GetByIdInput) => Promise<SaleEntity>;

	getByClientIdStatus: (
		p: GetByClientIdStatusInput,
	) => Promise<PaginatedItems<SaleEntity>>;

	getByStoreIdStatus: (
		p: GetByStoreIdStatusInput,
	) => Promise<PaginatedItems<SaleEntity>>;

	setExpiredStatus: () => Promise<void>;

	handleSaleDelivery: (p: SalePaidMessage) => Promise<void>;
}

/**
 *
 *
 * Topic Messages
 *
 *
 */

export type SaleCreatedMessage = SaleEntity;

export type SalePaidMessage = SaleEntity;

export type SaleDeliveredMessage = SaleEntity;

export type SaleDeliveryConfirmedMessage = SaleEntity;

export interface SaleExpiredMessage {
	sales: Array<SaleEntity>;
}
