import { Service } from "factories";
import { getDynamoInstance } from "repository/dynamodb";
import { BalanceRepositoryDynamoDB } from "repository/dynamodb/balance";
import { BalanceUseCaseImplementation } from "usecase/balance";

export class BalanceService extends Service<BalanceUseCaseImplementation> {
	public getInstance() {
		const dynamodb = getDynamoInstance();

		const balanceRepository = new BalanceRepositoryDynamoDB(dynamodb);

		return new BalanceUseCaseImplementation(balanceRepository);
	}
}
