import { S3Adapter } from "../adapters/implementations/s3";
import { SNSAdapter } from "../adapters/implementations/sns";
import { SQSAdapter } from "../adapters/implementations/sqs";
import type { StoreUseCase } from "../models/store";
import { UploadManagerProvider } from "../providers/implementations/upload-manager";
import { getDynamoInstance } from "../repository/dynamodb";
import { BlacklistRepositoryDynamoDB } from "../repository/dynamodb/blacklist";
import { CounterRepositoryDynamoDB } from "../repository/dynamodb/counter";
import { ProductRepositoryDynamoDB } from "../repository/dynamodb/product";
import { StoreRepositoryDynamoDB } from "../repository/dynamodb/store";
import { StoreUseCaseImplementation } from "../usecase/store";

import { Service } from ".";

let instance: StoreUseCaseImplementation;

export class StoreService extends Service<StoreUseCase> {
	public getInstance() {
		if (instance) return instance;

		const dynamodb = getDynamoInstance();
		const sns = new SNSAdapter();
		const sqs = new SQSAdapter();
		const s3 = new S3Adapter();

		const storeRepository = new StoreRepositoryDynamoDB(dynamodb);
		const productRepository = new ProductRepositoryDynamoDB(dynamodb);
		const blacklistRepository = new BlacklistRepositoryDynamoDB(dynamodb);
		const counterRepository = new CounterRepositoryDynamoDB(dynamodb);

		const uploadManager = new UploadManagerProvider(sqs, s3);

		const newInstance = new StoreUseCaseImplementation(
			storeRepository,
			productRepository,
			blacklistRepository,
			counterRepository,
			sns,
			uploadManager,
		);

		instance = newInstance;

		return instance;
	}
}
