import { SNSAdapter } from "adapters/implementations/sns";
import { Service } from "factories";
import { getDynamoInstance } from "repository/dynamodb";
import { AccessRepositoryDynamoDB } from "repository/dynamodb/access";
import { AccessUseCaseImplementation } from "usecase/access";

export class AccessService extends Service<AccessUseCaseImplementation> {
	public getInstance() {
		const dynamodb = getDynamoInstance();
		const sns = new SNSAdapter();

		const accessRepository = new AccessRepositoryDynamoDB(dynamodb);

		return new AccessUseCaseImplementation(accessRepository, sns);
	}
}
