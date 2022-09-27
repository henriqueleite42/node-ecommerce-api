import { S3Adapter } from "../adapters/implementations/s3";
import { SNSAdapter } from "../adapters/implementations/sns";
import { SQSAdapter } from "../adapters/implementations/sqs";
import type { StoreUseCase } from "../models/store";
import { UploadManagerProvider } from "../providers/implementations/upload-manager";
import { getDynamoInstance } from "../repository/dynamodb";
import { CounterRepositoryDynamoDB } from "../repository/dynamodb/counter";
import { StoreRepositoryDynamoDB } from "../repository/dynamodb/store";
import { StoreUseCaseImplementation } from "../usecase/store";

import { Service } from ".";

export class StoreService extends Service<StoreUseCase> {
	public getInstance() {
		const dynamodb = getDynamoInstance();
		const sns = new SNSAdapter();
		const sqs = new SQSAdapter();
		const s3 = new S3Adapter();

		const storeRepository = new StoreRepositoryDynamoDB(dynamodb);
		const counterRepository = new CounterRepositoryDynamoDB(dynamodb);

		const uploadManager = new UploadManagerProvider(sqs, s3);

		return new StoreUseCaseImplementation(
			storeRepository,
			counterRepository,
			sns,
			uploadManager,
		);
	}
}
