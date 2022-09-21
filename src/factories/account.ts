import { Service } from "factories";
import { getDynamoInstance } from "repository/dynamodb";
import { AccountRepositoryDynamoDB } from "repository/dynamodb/account";
import { StoreRepositoryDynamoDB } from "repository/dynamodb/store";
import { AccountUseCaseImplementation } from "usecase/account";

export class AccountService extends Service<AccountUseCaseImplementation> {
	public getInstance() {
		const dynamodb = getDynamoInstance();

		const accountRepository = new AccountRepositoryDynamoDB(dynamodb);
		const storeRepository = new StoreRepositoryDynamoDB(dynamodb);

		return new AccountUseCaseImplementation(accountRepository, storeRepository);
	}
}
