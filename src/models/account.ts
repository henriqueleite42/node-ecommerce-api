import type { StoreEntity } from "./store";

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

export interface GetByDiscordIdOutput extends AccountEntity {
	stores: Array<StoreEntity>;
}

export interface AccountUseCase {
	createWithDiscordId: (p: CreateWithDiscordIdInput) => Promise<AccountEntity>;

	getByDiscordId: (discordId: string) => Promise<GetByDiscordIdOutput>;
}
