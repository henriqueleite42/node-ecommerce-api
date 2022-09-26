import { SNSAdapter } from "../adapters/implementations/sns";
import type { AccessUseCase } from "../models/access";
import { getDynamoInstance } from "../repository/dynamodb";
import { AccessRepositoryDynamoDB } from "../repository/dynamodb/access";
import { AccessUseCaseImplementation } from "../usecase/access";

import { Service } from ".";

export class AccessService extends Service<AccessUseCase> {
	public getInstance() {
		const dynamodb = getDynamoInstance();
		const sns = new SNSAdapter();

		const accessRepository = new AccessRepositoryDynamoDB(dynamodb);

		return new AccessUseCaseImplementation(accessRepository, sns);
	}
}
