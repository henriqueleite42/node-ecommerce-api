import { S3Adapter } from "adapters/implementations/s3";
import { SQSAdapter } from "adapters/implementations/sqs";
import { Service } from "factories";
import type { ContentUseCase } from "models/content";
import { UploadManagerProvider } from "providers/implementations/upload-manager";
import { getDynamoInstance } from "repository/dynamodb";
import { ContentRepositoryDynamoDB } from "repository/dynamodb/content";
import { ContentUseCaseImplementation } from "usecase/content";

export class ContentService extends Service<ContentUseCase> {
	public getInstance() {
		const dynamodb = getDynamoInstance();
		const sqs = new SQSAdapter();
		const s3 = new S3Adapter();

		const contentRepository = new ContentRepositoryDynamoDB(dynamodb);

		const uploadManager = new UploadManagerProvider(sqs, s3);

		return new ContentUseCaseImplementation(contentRepository, uploadManager);
	}
}
