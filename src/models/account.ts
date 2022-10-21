import type { CreateMagicLinkInput, GetMagicLinkInput } from "./magic-link";

import type { PlatformEnum } from "../types/enums/platform";

export interface AccountEntity {
	accountId: string;
	admin: boolean;
	notifyThrough: PlatformEnum;
	discordId?: string;
	createdAt: Date;
}

/**
 *
 *
 * Repository
 *
 *
 */

export interface CreateWithDiscordIdInput {
	accountId: string;
	discordId: string;
}

export interface AccountRepository {
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

export interface GetByAccountIdInput {
	accountId: string;
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
	createWithDiscordId: (p: CreateWithDiscordIdInput) => Promise<AccountEntity>;

	getByAccountId: (p: GetByAccountIdInput) => Promise<AccountEntity>;

	getByDiscordId: (p: GetByDiscordIdInput) => Promise<AccountEntity>;

	createMagicLink: (p: CreateMagicLinkInput) => Promise<CreateMagicLinkOutput>;

	signInWithMagicLink: (p: GetMagicLinkInput) => Promise<AuthOutput>;

	refresh: (p: RefreshInput) => Promise<AuthOutput>;
}
