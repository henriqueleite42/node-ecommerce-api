import { DiscordJSAdapter } from "../adapters/implementations/discordjs";
import { PasetoAdapter } from "../adapters/implementations/paseto";
import type { AccountUseCase } from "../models/account";
import { getDynamoInstance } from "../repository/dynamodb";
import { AccountRepositoryDynamoDB } from "../repository/dynamodb/account";
import { MagicLinkRepositoryDynamoDB } from "../repository/dynamodb/magic-link";
import { RefreshTokenRepositoryDynamoDB } from "../repository/dynamodb/refresh-token";
import { AccountUseCaseImplementation } from "../usecase/account";

import { Service } from ".";

let instance: AccountUseCaseImplementation;

export class AccountService extends Service<AccountUseCase> {
	public getInstance() {
		if (instance) return instance;

		const dynamodb = getDynamoInstance();

		const accountRepository = new AccountRepositoryDynamoDB(dynamodb);
		const refreshTokenRepository = new RefreshTokenRepositoryDynamoDB(dynamodb);
		const magicLinkRepository = new MagicLinkRepositoryDynamoDB(dynamodb);

		const accessTokenManager = new PasetoAdapter();
		const discordManager = new DiscordJSAdapter();

		const newInstance = new AccountUseCaseImplementation(
			accountRepository,
			refreshTokenRepository,
			magicLinkRepository,
			accessTokenManager,
			discordManager,
		);

		instance = newInstance;

		return instance;
	}
}
