/**
 * -------------------------------------------------
 *
 * Magic Link is a sub-domain of the Account domain
 *
 * -------------------------------------------------
 */
export interface MagicLinkEntity {
	accountId: string;
	token: string;
	createdAt: Date;
	expiresAt: Date;
}

/**
 *
 *
 * Repository
 *
 *
 */

export type CreateMagicLinkInput = Pick<MagicLinkEntity, "accountId">;

export type GetMagicLinkInput = Pick<MagicLinkEntity, "token">;

export interface MagicLinkRepository {
	create: (p: CreateMagicLinkInput) => Promise<MagicLinkEntity>;

	get: (p: GetMagicLinkInput) => Promise<MagicLinkEntity | null>;
}
