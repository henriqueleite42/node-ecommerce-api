import { S3Adapter } from "../adapters/implementations/s3";
import { SNSAdapter } from "../adapters/implementations/sns";
import { SQSAdapter } from "../adapters/implementations/sqs";
import type { ProductUseCase } from "../models/product";
import { UploadManagerProvider } from "../providers/implementations/upload-manager";
import { getDynamoInstance } from "../repository/dynamodb";
import { CounterRepositoryDynamoDB } from "../repository/dynamodb/counter";
import { ProductRepositoryDynamoDB } from "../repository/dynamodb/product";
import { ProductUseCaseImplementation } from "../usecase/product";

import { Service } from ".";
import { StoreService } from "./store";

let instance: ProductUseCaseImplementation;

export class ProductService extends Service<ProductUseCase> {
	public getInstance() {
		if (instance) return instance;

		const dynamodb = getDynamoInstance();
		const sqs = new SQSAdapter();
		const sns = new SNSAdapter();
		const s3 = new S3Adapter();

		const uploadManager = new UploadManagerProvider(sqs, s3);

		const productRepository = new ProductRepositoryDynamoDB(dynamodb);
		const counterRepository = new CounterRepositoryDynamoDB(dynamodb);

		const storeUseCase = new StoreService().getInstance();

		const newInstance = new ProductUseCaseImplementation(
			productRepository,
			counterRepository,
			uploadManager,
			sqs,
			sns,
			storeUseCase,
		);

		instance = newInstance;

		return instance;
	}
}
