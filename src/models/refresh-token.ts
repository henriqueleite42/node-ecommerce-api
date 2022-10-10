/**
 * -------------------------------------------------
 *
 * Refresh Token is a sub-domain of the Account domain
 *
 * -------------------------------------------------
 */
export interface RefreshTokenEntity {
	accountId: string;
	token: string;
	createdAt: Date;
}

/**
 *
 *
 * Repository
 *
 *
 */

export type CreateRefreshTokenInput = Pick<RefreshTokenEntity, "accountId">;

export type GetByTokenRefreshTokenInput = Pick<RefreshTokenEntity, "token">;

export type GetByAccountIdRefreshTokenInput = Pick<
	RefreshTokenEntity,
	"accountId"
>;

export interface RefreshTokenRepository {
	create: (p: CreateRefreshTokenInput) => Promise<RefreshTokenEntity>;

	getByToken: (
		p: GetByTokenRefreshTokenInput,
	) => Promise<RefreshTokenEntity | null>;

	getByAccountId: (
		p: GetByAccountIdRefreshTokenInput,
	) => Promise<RefreshTokenEntity | null>;

	invalidate: (p: GetByAccountIdRefreshTokenInput) => Promise<void>;
}
