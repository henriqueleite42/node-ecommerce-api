import { Service } from "factories";
import type { WalletUseCase } from "models/wallet";
import { getDynamoInstance } from "repository/dynamodb";
import { WalletRepositoryDynamoDB } from "repository/dynamodb/wallet";
import { WalletUseCaseImplementation } from "usecase/wallet";

export class WalletService extends Service<WalletUseCase> {
	public getInstance() {
		const dynamodb = getDynamoInstance();

		const walletRepository = new WalletRepositoryDynamoDB(dynamodb);

		return new WalletUseCaseImplementation(walletRepository);
	}
}
