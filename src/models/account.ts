import type { CreateMagicLinkInput, GetMagicLinkInput } from "./magic-link";

export interface AccountEntity {
	accountId: string;
	admin: boolean;
	discordId?: string;
	discord?: {
		accessToken: string;
		refreshToken: string;
		expiresAt: Date;
	};
	createdAt: Date;
}

/**
 *
 *
 * Repository
 *
 *
 */

export interface CreateWithDiscordInput {
	discordId: string;
	discord: AccountEntity["discord"];
}

export interface CreateWithDiscordIdInput {
	discordId: string;
}

export interface AccountRepository {
	createWithDiscord: (p: CreateWithDiscordInput) => Promise<AccountEntity>;

	createWithDiscordId: (p: CreateWithDiscordIdInput) => Promise<AccountEntity>;

	getByAccountId: (accountId: string) => Promise<AccountEntity | null>;

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

export interface CreateAccountWithDiscordInput {
	code: string;
}

export interface GetByDiscordIdInput {
	discordId: string;
}

export interface CreateMagicLinkOutput {
	token: string;
}

export interface RefreshInput {
	refreshToken: string;
}

export interface AccountUseCase {
	createWithDiscord: (p: CreateAccountWithDiscordInput) => Promise<AuthOutput>;

	createWithDiscordId: (p: CreateWithDiscordIdInput) => Promise<AccountEntity>;

	getByDiscordId: (p: GetByDiscordIdInput) => Promise<AccountEntity>;

	createMagicLink: (p: CreateMagicLinkInput) => Promise<CreateMagicLinkOutput>;

	signInWithMagicLink: (p: GetMagicLinkInput) => Promise<AuthOutput>;

	refresh: (p: RefreshInput) => Promise<AuthOutput>;
}
