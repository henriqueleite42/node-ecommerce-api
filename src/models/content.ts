import type { GetFileOutput } from "../adapters/file-manager";
import type { GetUrlToUploadOutput } from "../providers/upload-manager";

import type { AccountAccessStoreEntity } from "./access-content";
import type { ProductEntity } from "./product";
import type { SaleEntity, SalePaidMessage, SaleProduct } from "./sale";
import type { PaginatedItems } from "./types";

import type { MediaTypeEnum } from "../types/enums/media-type";

export interface ContentEntity {
	contentId: string;
	storeId: string;
	productId: string;
	type: MediaTypeEnum;
	mediaPath?: string;
	createdAt: Date;
}

/**
 *
 *
 * Repository
 *
 *
 */

export interface CreateInput {
	storeId: string;
	productId: string;
	type: MediaTypeEnum;
}

export type EditInput = Partial<Omit<ContentEntity, "createdAt" | "type">> &
	Pick<ContentEntity, "contentId" | "productId" | "storeId">;

export interface GetContentInput {
	storeId: string;
	productId: string;
	contentId: string;
}

export interface GetFromProductInput {
	storeId: string;
	productId: string;
	limit: number;
	cursor?: string;
}

export interface ContentRepository {
	create: (p: CreateInput) => Promise<ContentEntity>;

	edit: (p: EditInput) => Promise<ContentEntity | null>;

	getContent: (p: GetContentInput) => Promise<ContentEntity | null>;

	getFromProduct: (
		p: GetFromProductInput,
	) => Promise<PaginatedItems<ContentEntity>>;
}

/**
 *
 *
 * Usecase
 *
 *
 */

export interface GetContentFileInput {
	accountId: string;
	storeId: string;
	productId: string;
	contentId: string;
}

export interface GetUrlToUploadRawMediaInput {
	storeId: string;
	productId: string;
	contentId: string;
	type: MediaTypeEnum;
}

export interface SetMediaPathInput {
	storeId: string;
	productId: string;
	contentId: string;
	mediaPath: string;
}

export interface GetUserAccessStoresInput {
	accountId: string;
	limit: number;
	cursor: string;
}

export interface ContentUseCase {
	create: (p: CreateInput) => Promise<ContentEntity>;

	getUrlToUploadMedia: (
		p: GetUrlToUploadRawMediaInput,
	) => Promise<GetUrlToUploadOutput>;

	setMediaPath: (p: SetMediaPathInput) => Promise<void>;

	getContentFile: (p: GetContentFileInput) => Promise<GetFileOutput>;

	getUserAccessStores: (
		p: GetUserAccessStoresInput,
	) => Promise<PaginatedItems<AccountAccessStoreEntity>>;

	giveAccessAfterSale: (p: SalePaidMessage) => Promise<void>;
}

/**
 *
 *
 * Topic Messages
 *
 *
 */

export interface ContentCreatedMessage {
	product: ProductEntity;
	content: ContentEntity;
}

export interface GiveBuyerAccessToSaleMessage {
	saleId: string;
	clientId: string;
	storeId: string;
	products: Array<SaleProduct>;
	origin: SaleEntity["origin"];
}

export interface AccessGrantedMessage {
	saleId: string;
	storeId: string;
	clientId: string;
	product: SaleProduct;
}
