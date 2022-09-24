import type {
	AccountUseCase,
	AccountRepository,
	CreateWithDiscordIdInput,
} from "models/account";
import type { StoreRepository } from "models/store";

export class AccountUseCaseImplementation implements AccountUseCase {
	public constructor(
		private readonly accountRepository: AccountRepository,
		private readonly storeRepository: StoreRepository,
	) {}

	public async createWithDiscordId(p: CreateWithDiscordIdInput) {
		const account = await this.accountRepository.getByDiscordId(p.discordId);

		if (account) {
			throw new Error("DUPLICATED_DISCORDID");
		}

		return this.accountRepository.createWithDiscordId(p);
	}

	public async getByDiscordId(discordId: string) {
		const account = await this.accountRepository.getByDiscordId(discordId);

		if (!account) {
			throw new Error("NOT_FOUND");
		}

		const stores = await this.storeRepository.getAllFromAccount({
			accountId: account.accountId,
			limit: 100,
		});

		return {
			...account,
			stores: stores.items,
		};
	}
}
