import type { SalePaidMessage } from "./sale";

export interface AccessEntity {
	accountId: string;
	storeId: string;
	productId: string;
	contentId?: string;
	createdAt: Date;
}

/**
 *
 *
 * Repository
 *
 *
 */

export type AccessId = Omit<AccessEntity, "createdAt" | "expiresAt">;

export interface CreateManyInput {
	accountId: string;
	accesses: Array<{
		storeId: string;
		productId: string;
		contentId?: string;
	}>;
}

export interface AccessRepository {
	createMany: (p: CreateManyInput) => Promise<Array<AccessEntity>>;

	get: (p: AccessId) => Promise<AccessEntity | null>;
}

/**
 *
 *
 * Usecase
 *
 *
 */

export interface AccessUseCase {
	giveAccessAfterSale: (p: SalePaidMessage) => Promise<void>;

	get: (p: AccessId) => Promise<AccessEntity>;
}

/**
 *
 *
 * Topic Messages
 *
 *
 */

export type AccessCreatedMessage = Array<AccessEntity>;
