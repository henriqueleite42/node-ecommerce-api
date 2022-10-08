import type { BlacklistUseCase } from "../models/blacklist";
import { getDynamoInstance } from "../repository/dynamodb";
import { BlacklistRepositoryDynamoDB } from "../repository/dynamodb/blacklist";
import { BlacklistUseCaseImplementation } from "../usecase/blacklist";

import { Service } from ".";

let instance: BlacklistUseCaseImplementation;

export class BlacklistService extends Service<BlacklistUseCase> {
	public getInstance() {
		if (instance) return instance;

		const dynamodb = getDynamoInstance();

		const blacklistRepository = new BlacklistRepositoryDynamoDB(dynamodb);

		const newInstance = new BlacklistUseCaseImplementation(blacklistRepository);

		instance = newInstance;

		return instance;
	}
}
