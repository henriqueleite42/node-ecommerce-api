import type { StoreEntity } from "./store";

export interface AccountEntity {
	accountId: string;
	discordId: string;
	balance: number;
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

export interface IncrementBalanceInput {
	accountId: string;
	amount: number;
}

export interface AccountRepository {
	createWithDiscordId: (p: CreateWithDiscordIdInput) => Promise<AccountEntity>;

	getByAccountId: (discordId: string) => Promise<AccountEntity | null>;

	getByDiscordId: (discordId: string) => Promise<AccountEntity | null>;

	incrementBalance: (p: IncrementBalanceInput) => Promise<void>;
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

	incrementBalance: (p: IncrementBalanceInput) => Promise<void>;
}
