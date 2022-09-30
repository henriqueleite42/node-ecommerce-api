import type { PaginatedItems } from "./types";

import type { DeliveryMethodEnum } from "../types/enums/delivery-method";
import type { MediaTypeEnum } from "../types/enums/media-type";
import type { ProductTypeEnum } from "../types/enums/product-type";

interface ProductVariation {
	id: string;
	name: string;
	description: string;
	price: number;
}

export interface ProductEntity {
	productId: string;
	storeId: string;
	type: ProductTypeEnum;
	name: string;
	description: string;
	color?: string;
	price?: number;
	imageUrl?: string;
	variations: Array<ProductVariation>;
	deliveryMethod: DeliveryMethodEnum;
	createdAt: Date;
}

/**
 *
 *
 * Repository
 *
 *
 */

export interface CreateInput
	extends Omit<
		ProductEntity,
		"createdAt" | "imageUrl" | "productId" | "variations"
	> {
	variations: Array<Omit<ProductVariation, "id">>;
}

export type EditInput = Partial<
	Omit<ProductEntity, "createdAt" | "deliveryMethod" | "type">
> &
	Pick<ProductEntity, "productId" | "storeId">;

export interface DeleteInput {
	storeId: string;
	productId: string;
}

export interface GetProductsByTypeInput
	extends Pick<ProductEntity, "storeId" | "type"> {
	limit: number;
	continueFrom?: string;
}

export type GetByIdInput = Pick<ProductEntity, "productId" | "storeId">;

export type GetManyByIdInput = Array<
	Pick<ProductEntity, "productId" | "storeId">
>;

export interface ProductRepository {
	create: (p: CreateInput) => Promise<ProductEntity>;

	edit: (p: EditInput) => Promise<ProductEntity | null>;

	delete: (p: DeleteInput) => Promise<void>;

	getProductsByType: (
		p: GetProductsByTypeInput,
	) => Promise<PaginatedItems<ProductEntity>>;

	getById: (p: GetByIdInput) => Promise<ProductEntity | null>;

	getManyById: (p: GetManyByIdInput) => Promise<Array<ProductEntity>>;
}

/**
 *
 *
 * Usecase
 *
 *
 */

export interface CreateProductInput extends CreateInput {
	imageUrl: ProductEntity["imageUrl"];
	contents?: Array<{
		type: MediaTypeEnum;
		mediaUrl: string;
	}>;
}

export interface UpdateImgInput {
	storeId: string;
	productId: string;
	imageUrl: string;
}

export interface IncreaseSalesCountInput {
	storeId: string;
	productId: string;
}

export interface IncreaseTotalBilledInput {
	storeId: string;
	productId: string;
	amount: number;
}

export interface GetProductsCountOutput {
	total: number;
}

export interface ProductUseCase {
	create: (p: CreateProductInput) => Promise<ProductEntity>;

	edit: (p: EditInput) => Promise<ProductEntity>;

	delete: (p: DeleteInput) => Promise<void>;

	getProductsByType: (
		p: GetProductsByTypeInput,
	) => Promise<PaginatedItems<ProductEntity>>;

	getById: (p: GetByIdInput) => Promise<ProductEntity>;

	updateImg: (p: UpdateImgInput) => Promise<void>;

	increaseProductsCount: () => Promise<void>;

	increaseSalesCount: (p: IncreaseSalesCountInput) => Promise<void>;

	increaseTotalBilled: (p: IncreaseTotalBilledInput) => Promise<void>;

	getTop: () => Promise<Array<ProductEntity>>;

	getProductsCount: () => Promise<GetProductsCountOutput>;
}

/**
 *
 *
 * Topic Messages
 *
 *
 */

export type ProductCreatedMessage = ProductEntity;

export type ProductDeletedMessage = ProductEntity;
