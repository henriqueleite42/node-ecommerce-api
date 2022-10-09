import type { GetUrlToUploadOutput } from "../adapters/file-manager";

import type { ProductEntity } from "./product";

import type { ProductTypeEnum } from "../types/enums/product-type";

export interface StoreEntity {
	storeId: string; // Same as accountId
	accountId: string;
	productTypes: Array<ProductTypeEnum>;
	name: string;
	description?: string;
	color?: string;
	bannerUrl?: string;
	avatarUrl?: string;
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
	extends Omit<StoreEntity, "createdAt" | "storeId"> {
	accountId: string;
}

export type EditInput = Partial<Omit<StoreEntity, "createdAt" | "name">> &
	Pick<StoreEntity, "storeId">;

export interface ModifyProductTypeInput {
	storeId: string;
	productType: ProductTypeEnum;
}

export type GetByIdInput = Pick<StoreEntity, "storeId">;

export type GetManyByIdInput = Array<Pick<StoreEntity, "storeId">>;

export type GetByNameInput = Pick<StoreEntity, "name">;

export interface StoreRepository {
	create: (p: CreateInput) => Promise<StoreEntity>;

	edit: (p: EditInput) => Promise<StoreEntity | null>;

	addProductType: (p: ModifyProductTypeInput) => Promise<void>;

	removeProductType: (p: ModifyProductTypeInput) => Promise<void>;

	getById: (p: GetByIdInput) => Promise<StoreEntity | null>;

	getManyById: (p: GetManyByIdInput) => Promise<Array<StoreEntity>>;

	getByName: (p: GetByNameInput) => Promise<StoreEntity | null>;
}

/**
 *
 *
 * Usecase
 *
 *
 */

export interface GetUrlToUploadImgInput {
	storeId: string;
}

export interface IncreaseSalesCountInput {
	storeId: string;
}

export interface IncreaseTotalBilledInput {
	storeId: string;
	amount: number;
}

export interface GetStoresCountOutput {
	total: number;
}

export interface StoreUseCase {
	create: (p: CreateInput) => Promise<StoreEntity>;

	edit: (p: EditInput) => Promise<StoreEntity>;

	getUrlToUploadAvatar: (
		p: GetUrlToUploadImgInput,
	) => Promise<GetUrlToUploadOutput>;

	getUrlToUploadBanner: (
		p: GetUrlToUploadImgInput,
	) => Promise<GetUrlToUploadOutput>;

	addProductType: (p: ProductEntity) => Promise<void>;

	removeProductType: (p: ProductEntity) => Promise<void>;

	getByName: (p: GetByNameInput) => Promise<StoreEntity>;

	getTop: () => Promise<Array<StoreEntity>>;

	getStoresCount: () => Promise<GetStoresCountOutput>;

	increaseStoresCount: () => Promise<void>;

	increaseSalesCount: (p: IncreaseSalesCountInput) => Promise<void>;

	increaseTotalBilled: (p: IncreaseTotalBilledInput) => Promise<void>;
}

/**
 *
 *
 * Topic Messages
 *
 *
 */

export type StoreCreatedMessage = StoreEntity;
