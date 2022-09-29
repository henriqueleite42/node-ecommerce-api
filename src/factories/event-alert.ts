import { SQSAdapter } from "../adapters/implementations/sqs";
import type { EventAlertUseCase } from "../models/event-alert";
import { getDynamoInstance } from "../repository/dynamodb";
import { EventAlertRepositoryDynamoDB } from "../repository/dynamodb/event-alert";
import { EventAlertUseCaseImplementation } from "../usecase/event-alert";

import { Service } from ".";

export class EventAlertService extends Service<EventAlertUseCase> {
	public getInstance() {
		const dynamodb = getDynamoInstance();
		const sqs = new SQSAdapter();

		const eventAlertRepository = new EventAlertRepositoryDynamoDB(dynamodb);

		return new EventAlertUseCaseImplementation(eventAlertRepository, sqs);
	}
}
