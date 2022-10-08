import type { WalletUseCase } from "../models/wallet";
import { getDynamoInstance } from "../repository/dynamodb";
import { WalletRepositoryDynamoDB } from "../repository/dynamodb/wallet";
import { WalletUseCaseImplementation } from "../usecase/wallet";

import { Service } from ".";

let instance: WalletUseCaseImplementation;

export class WalletService extends Service<WalletUseCase> {
	public getInstance() {
		if (instance) return instance;

		const dynamodb = getDynamoInstance();

		const walletRepository = new WalletRepositoryDynamoDB(dynamodb);

		const newInstance = new WalletUseCaseImplementation(walletRepository);

		instance = newInstance;

		return instance;
	}
}
