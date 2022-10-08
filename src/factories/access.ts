import { SNSAdapter } from "../adapters/implementations/sns";
import type { AccessUseCase } from "../models/access";
import { getDynamoInstance } from "../repository/dynamodb";
import { AccessRepositoryDynamoDB } from "../repository/dynamodb/access";
import { AccessUseCaseImplementation } from "../usecase/access";

import { Service } from ".";

let instance: AccessUseCaseImplementation;

export class AccessService extends Service<AccessUseCase> {
	public getInstance() {
		if (instance) return instance;

		const dynamodb = getDynamoInstance();
		const sns = new SNSAdapter();

		const accessRepository = new AccessRepositoryDynamoDB(dynamodb);

		const newInstance = new AccessUseCaseImplementation(accessRepository, sns);

		instance = newInstance;

		return instance;
	}
}
