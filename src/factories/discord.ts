import { DiscordJSAdapter } from "../adapters/implementations/discordjs";
import type { DiscordUseCase } from "../models/discord";
import { getDynamoInstance } from "../repository/dynamodb";
import { AccountRepositoryDynamoDB } from "../repository/dynamodb/account";
import { DiscordUseCaseImplementation } from "../usecase/discord";

import { Service } from ".";

let instance: DiscordUseCaseImplementation;

export class DiscordService extends Service<DiscordUseCase> {
	public getInstance() {
		if (instance) return instance;

		const dynamodb = getDynamoInstance();

		const discordManager = new DiscordJSAdapter();

		const accountRepository = new AccountRepositoryDynamoDB(dynamodb);

		const newInstance = new DiscordUseCaseImplementation(
			accountRepository,
			discordManager,
		);

		instance = newInstance;

		return instance;
	}
}
