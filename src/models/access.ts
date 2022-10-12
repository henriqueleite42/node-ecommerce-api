import type { SalePaidMessage } from "./sale";

export interface AccessEntity {
	accountId: string;
	storeId: string;
	productId: string;
	variationId?: string;
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

export type AccessIds = Omit<AccessEntity, "createdAt" | "expiresAt">;

export interface CreateManyInput {
	accountId: string;
	accesses: Array<{
		storeId: string;
		productId: string;
		variationId?: string;
		contentId?: string;
	}>;
}

export interface AccessRepository {
	createMany: (p: CreateManyInput) => Promise<Array<AccessEntity>>;

	get: (p: AccessIds) => Promise<AccessEntity | null>;
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

	get: (p: AccessIds) => Promise<AccessEntity>;
}

/**
 *
 *
 * Topic Messages
 *
 *
 */

export type AccessCreatedMessage = Array<AccessEntity>;
