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

export interface GetByDiscordIdInput {
	discordId: string;
}

export interface AccountUseCase {
	createWithDiscordId: (p: CreateWithDiscordIdInput) => Promise<AccountEntity>;

	getByDiscordId: (p: GetByDiscordIdInput) => Promise<AccountEntity>;
}
