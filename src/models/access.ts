export interface AccessEntity {
	accountId: string;
	storeId: string;
	productId: string;
	variationId?: string;
	createdAt: Date;
	expiresAt?: Date;
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
	createMany: (p: CreateManyInput) => Promise<void>;

	get: (p: AccessIds) => Promise<AccessEntity>;
}
