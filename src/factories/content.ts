import { S3Adapter } from "../adapters/implementations/s3";
import { SNSAdapter } from "../adapters/implementations/sns";
import type { ContentUseCase } from "../models/content";
import { getDynamoInstance } from "../repository/dynamodb";
import { AccessContentRepositoryDynamoDB } from "../repository/dynamodb/access-content";
import { AccountAccessStoreRepositoryDynamoDB } from "../repository/dynamodb/account-access-store";
import { ContentRepositoryDynamoDB } from "../repository/dynamodb/content";
import { StoreRepositoryDynamoDB } from "../repository/dynamodb/store";
import { ContentUseCaseImplementation } from "../usecase/content";

import { Service } from ".";
import { ProductService } from "./product";

let instance: ContentUseCaseImplementation;

export class ContentService extends Service<ContentUseCase> {
	public getInstance() {
		if (instance) return instance;

		const dynamodb = getDynamoInstance();
		const s3 = new S3Adapter();
		const sns = new SNSAdapter();

		const contentRepository = new ContentRepositoryDynamoDB(dynamodb);
		const accessRepository = new AccessContentRepositoryDynamoDB(dynamodb);
		const accountAccessStoreRepository =
			new AccountAccessStoreRepositoryDynamoDB(dynamodb);
		const storeRepository = new StoreRepositoryDynamoDB(dynamodb);

		const productUsecase = new ProductService().getInstance();

		const newInstance = new ContentUseCaseImplementation(
			contentRepository,
			accessRepository,
			accountAccessStoreRepository,
			storeRepository,
			s3,
			sns,

			productUsecase,
		);

		instance = newInstance;

		return instance;
	}
}
