import type { PaginatedItems } from "./types";

export interface StoreEntity {
	storeId: string;
	accountId: string;
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

export type CreateInput = Omit<StoreEntity, "createdAt" | "storeId">;

export type EditInput = Partial<Omit<StoreEntity, "createdAt" | "name">> &
	Pick<StoreEntity, "accountId" | "storeId">;

export interface GetAllFromAccountInput extends Pick<StoreEntity, "accountId"> {
	limit: number;
	continueFrom?: string;
}

export type GetByIdInput = Pick<StoreEntity, "storeId">;

export type GetManyByIdInput = Array<Pick<StoreEntity, "storeId">>;

export type GetByNameInput = Pick<StoreEntity, "name">;

export interface StoreRepository {
	create: (p: CreateInput) => Promise<StoreEntity>;

	edit: (p: EditInput) => Promise<StoreEntity | null>;

	getAllFromAccount: (
		p: GetAllFromAccountInput,
	) => Promise<PaginatedItems<StoreEntity>>;

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

export interface IncreaseSalesCountInput {
	storeId: string;
}

export interface IncreaseTotalBilledInput {
	storeId: string;
	amount: number;
}

export interface StoreUseCase {
	create: (p: CreateInput) => Promise<StoreEntity>;

	edit: (p: EditInput) => Promise<StoreEntity>;

	getAllFromAccount: (
		p: GetAllFromAccountInput,
	) => Promise<PaginatedItems<StoreEntity>>;

	getByName: (p: GetByNameInput) => Promise<StoreEntity>;

	getTop: () => Promise<Array<StoreEntity>>;

	increaseSalesCount: (p: IncreaseSalesCountInput) => Promise<void>;

	increaseTotalBilled: (p: IncreaseTotalBilledInput) => Promise<void>;
}
