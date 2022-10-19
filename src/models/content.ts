import type { GetFileOutput } from "../adapters/file-manager";
import type { GetUrlToUploadOutput } from "../providers/upload-manager";

import type { AccountAccessStoreEntity } from "./access-content";
import type { SaleEntity, SalePaidMessage, SaleProduct } from "./sale";
import type { PaginatedItems } from "./types";

import type { MediaTypeEnum } from "../types/enums/media-type";

export interface ContentEntity {
	contentId: string;
	storeId: string;
	productId: string;
	type: MediaTypeEnum;
	rawContentPath?: string;
	processedContentPath?: string;
	createdAt: Date;
}

/**
 *
 *
 * Repository
 *
 *
 */

export interface CreateManyInput
	extends Pick<ContentEntity, "productId" | "storeId"> {
	contents: Array<{
		type: MediaTypeEnum;
	}>;
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
	createMany: (p: CreateManyWithUrlInput) => Promise<Array<ContentEntity>>;

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

export interface CreateManyWithUrlInput
	extends Pick<ContentEntity, "productId" | "storeId"> {
	contents: Array<{
		type: MediaTypeEnum;
		mediaUrl: string;
	}>;
}

export interface GetUserAccessStoresInput {
	accountId: string;
	limit: number;
	cursor: string;
}

export interface ContentUseCase {
	createManyWithUrl: (
		p: CreateManyWithUrlInput,
	) => Promise<Array<ContentEntity>>;

	getUrlToUploadRawMedia: (
		p: GetUrlToUploadRawMediaInput,
	) => Promise<GetUrlToUploadOutput>;

	getContentFile: (p: GetContentFileInput) => Promise<GetFileOutput>;

	edit: (p: EditInput) => Promise<ContentEntity | null>;

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

export type GiveBuyerAccessToSaleMessage = SaleEntity;

export interface AccessGrantedMessage {
	saleId: string;
	clientId: string;
	product: SaleProduct;
}
