import { S3Adapter } from "../adapters/implementations/s3";
import { SQSAdapter } from "../adapters/implementations/sqs";
import type { ContentUseCase } from "../models/content";
import { UploadManagerProvider } from "../providers/implementations/upload-manager";
import { getDynamoInstance } from "../repository/dynamodb";
import { AccessRepositoryDynamoDB } from "../repository/dynamodb/access";
import { ContentRepositoryDynamoDB } from "../repository/dynamodb/content";
import { ContentUseCaseImplementation } from "../usecase/content";

import { Service } from ".";

let instance: ContentUseCaseImplementation;

export class ContentService extends Service<ContentUseCase> {
	public getInstance() {
		if (instance) return instance;

		const dynamodb = getDynamoInstance();
		const sqs = new SQSAdapter();
		const s3 = new S3Adapter();

		const contentRepository = new ContentRepositoryDynamoDB(dynamodb);
		const accessRepository = new AccessRepositoryDynamoDB(dynamodb);

		const uploadManager = new UploadManagerProvider(sqs, s3);

		const newInstance = new ContentUseCaseImplementation(
			contentRepository,
			accessRepository,
			uploadManager,
			s3,
		);

		instance = newInstance;

		return instance;
	}
}
