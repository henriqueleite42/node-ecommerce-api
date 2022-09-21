import { Service } from "factories";
import { getDynamoInstance } from "repository/dynamodb";
import { CounterRepositoryDynamoDB } from "repository/dynamodb/counter";
import { StoreRepositoryDynamoDB } from "repository/dynamodb/store";
import { StoreUseCaseImplementation } from "usecase/store";

export class StoreService extends Service<StoreUseCaseImplementation> {
	public getInstance() {
		const dynamodb = getDynamoInstance();

		const storeRepository = new StoreRepositoryDynamoDB(dynamodb);
		const counterRepository = new CounterRepositoryDynamoDB(dynamodb);

		return new StoreUseCaseImplementation(storeRepository, counterRepository);
	}
}
