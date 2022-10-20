import { DiscordJSAdapter } from "../adapters/implementations/discordjs";
import type { DiscordUseCase } from "../models/discord";
import { getDynamoInstance } from "../repository/dynamodb";
import { DiscordRepositoryDynamoDB } from "../repository/dynamodb/discord";
import { DiscordUseCaseImplementation } from "../usecase/discord";

import { Service } from ".";

let instance: DiscordUseCaseImplementation;

export class DiscordService extends Service<DiscordUseCase> {
	public getInstance() {
		if (instance) return instance;

		const dynamodb = getDynamoInstance();

		const discordManager = new DiscordJSAdapter();

		const discordRepository = new DiscordRepositoryDynamoDB(dynamodb);

		const newInstance = new DiscordUseCaseImplementation(
			discordRepository,
			discordManager,
		);

		instance = newInstance;

		return instance;
	}
}
