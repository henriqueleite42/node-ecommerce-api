export interface BlacklistEntity {
	accountId: string;
	storeCreation?: boolean;
	buying?: boolean;
}

/**
 *
 *
 * Repository
 *
 *
 */

export interface CreateInput
	extends Partial<Omit<BlacklistEntity, "accountId">> {
	accountId: string;
}
export interface GetInput {
	accountId: string;
}

export interface BlacklistRepository {
	create: (p: CreateInput) => Promise<BlacklistEntity>;

	get: (p: GetInput) => Promise<BlacklistEntity>;
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

export interface BlacklistUseCase {
	blacklist: (p: CreateInput) => Promise<void>;
}
