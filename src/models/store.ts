/* eslint-disable capitalized-comments */
/* eslint-disable multiline-comment-style */

import type { GetUrlToUploadOutput } from "../adapters/file-manager";

import type { ProductEntity } from "./product";

import type { GenderEnum } from "../types/enums/gender";
import type { ProductTypeEnum } from "../types/enums/product-type";

export interface StoreEntity {
	storeId: string; // Same as accountId
	accountId: string;
	productTypes: Array<ProductTypeEnum>;
	gender: GenderEnum;
	name: string;
	description?: string;
	color?: string;
	bannerUrl?: string;
	avatarUrl?: string;
	createdAt: Date;

	// Only used by the top stores
	// storeId: "TOP_STORES";
	imageUrl?: string;
	stores?: Array<{
		storeId: string;
		name: string;
		gender: GenderEnum;
	}>;
}

/**
 *
 *
 * Repository
 *
 *
 */

export type CreateInput = Omit<
	StoreEntity,
	"avatarUrl" | "bannerUrl" | "createdAt" | "storeId"
>;

export type EditInput = Partial<Omit<StoreEntity, "createdAt" | "name">> &
	Pick<StoreEntity, "storeId">;

export interface ModifyProductTypeInput {
	storeId: string;
	productType: ProductTypeEnum;
}

export type GetByIdInput = Pick<StoreEntity, "storeId">;

export type GetManyByIdInput = Array<Pick<StoreEntity, "storeId">>;

export type GetByNameInput = Pick<StoreEntity, "name">;

export interface CreateTopStoresEntityInput {
	imageUrl: string;
	stores: Array<{
		storeId: string;
		name: string;
		gender: GenderEnum;
	}>;
}

export interface TopStoresOutput {
	imageUrl: string;
	stores: Array<{
		storeId: string;
		name: string;
		gender: GenderEnum;
	}>;
}

export interface StoreRepository {
	create: (p: CreateInput) => Promise<StoreEntity>;

	edit: (p: EditInput) => Promise<StoreEntity | null>;

	addProductType: (p: ModifyProductTypeInput) => Promise<void>;

	removeProductType: (p: ModifyProductTypeInput) => Promise<void>;

	getById: (p: GetByIdInput) => Promise<StoreEntity | null>;

	getManyById: (p: GetManyByIdInput) => Promise<Array<StoreEntity>>;

	getByName: (p: GetByNameInput) => Promise<StoreEntity | null>;

	createTopStores: (p: CreateTopStoresEntityInput) => Promise<TopStoresOutput>;

	getTopStores: () => Promise<TopStoresOutput>;
}

/**
 *
 *
 * Usecase
 *
 *
 */

export type EditStoreInput = Omit<EditInput, "avatarUrl" | "bannerUrl">;

export interface GetUrlToUploadImgInput {
	storeId: string;
}

export interface UpdateAvatarUrlInput {
	storeId: string;
	avatarUrl: string;
}

export interface UpdateBannerUrlInput {
	storeId: string;
	bannerUrl: string;
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

export interface CreateTopStoresInput {
	storesNames: Array<string>;
}

export interface StoreUseCase {
	create: (p: CreateInput) => Promise<StoreEntity>;

	edit: (p: EditStoreInput) => Promise<StoreEntity>;

	getUrlToUploadAvatar: (
		p: GetUrlToUploadImgInput,
	) => Promise<GetUrlToUploadOutput>;

	getUrlToUploadBanner: (
		p: GetUrlToUploadImgInput,
	) => Promise<GetUrlToUploadOutput>;

	updateAvatarUrl: (p: UpdateAvatarUrlInput) => void;

	updateBannerUrl: (p: UpdateBannerUrlInput) => void;

	addProductType: (p: ProductEntity) => Promise<void>;

	removeProductType: (p: ProductEntity) => Promise<void>;

	getById: (p: GetByIdInput) => Promise<StoreEntity>;

	getByName: (p: GetByNameInput) => Promise<StoreEntity>;

	getStoresCount: () => Promise<GetStoresCountOutput>;

	increaseStoresCount: () => Promise<void>;

	increaseSalesCount: (p: IncreaseSalesCountInput) => Promise<void>;

	increaseTotalBilled: (p: IncreaseTotalBilledInput) => Promise<void>;

	createTopStores: (p: CreateTopStoresInput) => Promise<TopStoresOutput>;

	getTopStores: () => Promise<TopStoresOutput>;
}

/**
 *
 *
 * Topic Messages
 *
 *
 */

export type StoreCreatedMessage = StoreEntity;
