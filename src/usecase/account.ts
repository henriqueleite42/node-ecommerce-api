import type {
	AccountUseCase,
	AccountRepository,
	CreateWithDiscordIdInput,
	GetByDiscordIdInput,
} from "../models/account";

import { CustomError } from "../utils/error";

import { StatusCodeEnum } from "../types/enums/status-code";

export class AccountUseCaseImplementation implements AccountUseCase {
	public constructor(private readonly accountRepository: AccountRepository) {}

	public async createWithDiscordId(p: CreateWithDiscordIdInput) {
		const account = await this.accountRepository.getByDiscordId(p.discordId);

		if (account) {
			throw new CustomError(
				"An account with the same discordID already exists",
				StatusCodeEnum.CONFLICT,
			);
		}

		return this.accountRepository.createWithDiscordId(p);
	}

	public async getByDiscordId({ discordId }: GetByDiscordIdInput) {
		const account = await this.accountRepository.getByDiscordId(discordId);

		if (!account) {
			throw new CustomError("Not Found", StatusCodeEnum.NOT_FOUND);
		}

		return account;
	}
}
