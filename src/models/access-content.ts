/* eslint-disable capitalized-comments */
/**
 * -------------------------------------------------
 *
 * Access Content is a sub-domain of the Content domain
 *
 * -------------------------------------------------
 */
import type { PaginatedItems } from "./types";

import type { MediaTypeEnum } from "../types/enums/media-type";

/**
 * Types of records in this table
 *
 * ---------------   AccessContentEntity   ------------------
 * With `contentId` being an ID
 * - Contents from a product with type PACK, CUSTOM_VIDEO,
 * CUSTOM_PHOTO or CUSTOM_AUDIO
 * - Used to get the content file, so the user can see them
 *
 * With `contentId = undefined`
 * - For products that have only 1 content, like the products with
 * type VIDEO, PHOTO and AUDIO. This DOESN'T applies for products with
 * type CUSTOM_VIDEO, CUSTOM_PHOTO or CUSTOM_AUDIO, because there are
 * multiple contents, since the buyer can buy multiple custom medias.
 *
 * ---------------   HasAccessToProductContentsEntity   ------------------
 *
 * With `contentId = ALL`
 * - Used BY US, for product with type PACK, to be able to update
 * the contents of the product when the store updates them (like
 * adding a new content, deleting a content, updating the path, etc)
 *
 * ---------------   AccountAccessesStoresEntity   ------------------
 *
 * This entity is used to populate the frontend, so the user can see all
 * the stores where he bought content
 */
export interface AccessContentEntity {
	accountId: string;
	storeId: string;
	productId: string;
	contentId: string | "ALL";
	type?: MediaTypeEnum;
	mediaPath?: string;
	createdAt: Date;
}
export interface AccountAccessStoreEntity {
	accountId: string;
	storeId: string;
	storeName: string;
	createdAt: Date;
	store: {
		color?: string;
		avatarUrl?: string;
	};
}

/**
 *
 *
 * Repository
 *
 *
 */

export interface GetAccessContentId {
	accountId: string;
	storeId: string;
	productId: string;
	contentId: string;
}

export type CreateManyInput = Array<{
	accountId: string;
	contentId: string | "ALL";
	storeId: string;
	productId: string;
	type?: MediaTypeEnum;
	mediaPath?: string;
}>;

export interface GetFromProductInput {
	accountId: string;
	storeId: string;
	productId: string;
	limit: number;
	cursor?: string;
}

export interface AccessContentRepository {
	createMany: (p: CreateManyInput) => Promise<Array<AccessContentEntity>>;

	get: (p: GetAccessContentId) => Promise<AccessContentEntity | null>;

	getFromProduct: (
		p: GetFromProductInput,
	) => Promise<PaginatedItems<AccessContentEntity>>;
}

export interface CreateInput {
	accountId: string;
	storeId: string;
	storeName: string;
	store: {
		color?: string;
		avatarUrl?: string;
	};
}

export interface GetListInput {
	accountId: string;
	limit: number;
	cursor: string;
}

export interface AccountAccessesStoresRepository {
	create: (p: CreateInput) => Promise<AccountAccessStoreEntity>;

	getList: (
		p: GetListInput,
	) => Promise<PaginatedItems<AccountAccessStoreEntity>>;
}
