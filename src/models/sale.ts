import type { CreatePixOutput } from "adapters/pix-manager";

import type { PaginatedItems } from "./types";

import type { DeliveryMethodEnum } from "types/enums/delivery-method";
import type { PaymentMethodEnum } from "types/enums/payment-method";
import type { SalesStatusEnum } from "types/enums/sale-status";

export interface SaleProduct {
	productId: string;
	variationId?: string;
	name: string;
	description: string;
	price: number;
	imageUrl?: string;
	deliveryMethod: DeliveryMethodEnum;
}

export interface SaleEntity {
	saleId: string;
	storeId: string;
	clientId: string;
	status: SalesStatusEnum;
	products: Array<SaleProduct>;
	finalPrice: number;
	createdAt: Date;
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

export interface SaleRepository {
	create: (p: CreateInput) => Promise<SaleEntity>;

	edit: (p: EditInput) => Promise<SaleEntity | null>;

	getById: (p: GetByIdInput) => Promise<SaleEntity | null>;

	getByClientIdStatus: (
		p: GetByClientIdStatusInput,
	) => Promise<PaginatedItems<SaleEntity>>;

	getByStoreIdStatus: (
		p: GetByStoreIdStatusInput,
	) => Promise<PaginatedItems<SaleEntity>>;
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
	saleId: SaleEntity["saleId"];
	product: {
		productId: string;
		variationId?: string;
	};
}

export interface CheckoutSaleInput {
	saleId: string;
	paymentMethod: PaymentMethodEnum;
}

export interface CheckoutSaleOutput {
	pixData: CreatePixOutput;
}

export interface ProcessPaymentSaleInput {
	saleId: string;
}

export interface SaleUseCase {
	create: (p: CreateSaleInput) => Promise<SaleEntity>;

	addProduct: (p: AddProductSaleInput) => Promise<SaleEntity>;

	checkout: (p: CheckoutSaleInput) => Promise<CheckoutSaleOutput>;

	processPayment: (p: ProcessPaymentSaleInput) => Promise<void>;

	getById: (p: GetByIdInput) => Promise<SaleEntity>;

	getByClientIdStatus: (
		p: GetByClientIdStatusInput,
	) => Promise<PaginatedItems<SaleEntity>>;

	getByStoreIdStatus: (
		p: GetByStoreIdStatusInput,
	) => Promise<PaginatedItems<SaleEntity>>;
}
