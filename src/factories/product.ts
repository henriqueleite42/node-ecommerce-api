import { S3Adapter } from "../adapters/implementations/s3";
import { SQSAdapter } from "../adapters/implementations/sqs";
import type { ProductUseCase } from "../models/product";
import { UploadManagerProvider } from "../providers/implementations/upload-manager";
import { getDynamoInstance } from "../repository/dynamodb";
import { ContentRepositoryDynamoDB } from "../repository/dynamodb/content";
import { CounterRepositoryDynamoDB } from "../repository/dynamodb/counter";
import { ProductRepositoryDynamoDB } from "../repository/dynamodb/product";
import { ContentUseCaseImplementation } from "../usecase/content";
import { ProductUseCaseImplementation } from "../usecase/product";

import { Service } from ".";

export class ProductService extends Service<ProductUseCase> {
	public getInstance() {
		const dynamodb = getDynamoInstance();
		const sqs = new SQSAdapter();
		const s3 = new S3Adapter();

		const uploadManager = new UploadManagerProvider(sqs, s3);

		const productRepository = new ProductRepositoryDynamoDB(dynamodb);
		const counterRepository = new CounterRepositoryDynamoDB(dynamodb);
		const contentRepository = new ContentRepositoryDynamoDB(dynamodb);

		const contentUseCase = new ContentUseCaseImplementation(
			contentRepository,
			uploadManager,
		);

		return new ProductUseCaseImplementation(
			productRepository,
			counterRepository,
			contentUseCase,
			uploadManager,
		);
	}
}
