import type { CreateMagicLinkInput, GetMagicLinkInput } from "./magic-link";

export interface AccountEntity {
	accountId: string;
	discordId: string;
	createdAt: Date;
}

/**
 *
 *
 * Repository
 *
 *
 */

export type CreateWithDiscordIdInput = Pick<AccountEntity, "discordId">;

export interface AccountRepository {
	createWithDiscordId: (p: CreateWithDiscordIdInput) => Promise<AccountEntity>;

	getByAccountId: (discordId: string) => Promise<AccountEntity | null>;

	getByDiscordId: (discordId: string) => Promise<AccountEntity | null>;
}

/**
 *
 *
 * Usecase
 *
 *
 */

export interface AuthOutput {
	accountId: string;
	accessToken: string;
	refreshToken: string;
	expiresAt: string;
}

export interface GetByDiscordIdInput {
	discordId: string;
}

export interface CreateMagicLinkOutput {
	token: string;
}

export interface AccountUseCase {
	createWithDiscordId: (p: CreateWithDiscordIdInput) => Promise<AccountEntity>;

	getByDiscordId: (p: GetByDiscordIdInput) => Promise<AccountEntity>;

	createMagicLink: (p: CreateMagicLinkInput) => Promise<CreateMagicLinkOutput>;

	signInWithMagicLink: (p: GetMagicLinkInput) => Promise<AuthOutput>;
}
