import type {
	AccountUseCase,
	AccountRepository,
	CreateWithDiscordIdInput,
	GetByDiscordIdInput,
} from "../models/account";

export class AccountUseCaseImplementation implements AccountUseCase {
	public constructor(private readonly accountRepository: AccountRepository) {}

	public async createWithDiscordId(p: CreateWithDiscordIdInput) {
		const account = await this.accountRepository.getByDiscordId(p.discordId);

		if (account) {
			throw new Error("DUPLICATED_DISCORD_ID");
		}

		return this.accountRepository.createWithDiscordId(p);
	}

	public async getByDiscordId({ discordId }: GetByDiscordIdInput) {
		const account = await this.accountRepository.getByDiscordId(discordId);

		if (!account) {
			throw new Error("NOT_FOUND");
		}

		return account;
	}
}
