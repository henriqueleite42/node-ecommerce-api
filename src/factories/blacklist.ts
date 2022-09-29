import type { BlacklistUseCase } from "../models/blacklist";
import { getDynamoInstance } from "../repository/dynamodb";
import { BlacklistRepositoryDynamoDB } from "../repository/dynamodb/blacklist";
import { BlacklistUseCaseImplementation } from "../usecase/blacklist";

import { Service } from ".";

export class BlacklistService extends Service<BlacklistUseCase> {
	public getInstance() {
		const dynamodb = getDynamoInstance();

		const blacklistRepository = new BlacklistRepositoryDynamoDB(dynamodb);

		return new BlacklistUseCaseImplementation(blacklistRepository);
	}
}
