import type { AccountUseCase } from "../models/account";
import { getDynamoInstance } from "../repository/dynamodb";
import { AccountRepositoryDynamoDB } from "../repository/dynamodb/account";
import { AccountUseCaseImplementation } from "../usecase/account";

import { Service } from ".";

let instance: AccountUseCaseImplementation;

export class AccountService extends Service<AccountUseCase> {
	public getInstance() {
		if (instance) return instance;

		const dynamodb = getDynamoInstance();

		const accountRepository = new AccountRepositoryDynamoDB(dynamodb);

		const newInstance = new AccountUseCaseImplementation(accountRepository);

		instance = newInstance;

		return instance;
	}
}
