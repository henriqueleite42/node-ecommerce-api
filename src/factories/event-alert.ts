import { SQSAdapter } from "../adapters/implementations/sqs";
import type { EventAlertUseCase } from "../models/event-alert";
import { getDynamoInstance } from "../repository/dynamodb";
import { EventAlertRepositoryDynamoDB } from "../repository/dynamodb/event-alert";
import { StoreRepositoryDynamoDB } from "../repository/dynamodb/store";
import { EventAlertUseCaseImplementation } from "../usecase/event-alert";

import { Service } from ".";

export class EventAlertService extends Service<EventAlertUseCase> {
	public getInstance() {
		const dynamodb = getDynamoInstance();
		const sqs = new SQSAdapter();

		const eventAlertRepository = new EventAlertRepositoryDynamoDB(dynamodb);
		const storeRepository = new StoreRepositoryDynamoDB(dynamodb);

		return new EventAlertUseCaseImplementation(
			eventAlertRepository,
			storeRepository,
			sqs,
		);
	}
}
