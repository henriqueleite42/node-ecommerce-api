import { GerenciarnetManager } from "adapters/implementations/gerencianet";
import { SNSAdapter } from "adapters/implementations/sns";
import { Service } from "factories";
import { getDynamoInstance } from "repository/dynamodb";
import { ProductRepositoryDynamoDB } from "repository/dynamodb/product";
import { SaleRepositoryDynamoDB } from "repository/dynamodb/sale";
import { SaleUseCaseImplementation } from "usecase/sale";

export class SaleService extends Service<SaleUseCaseImplementation> {
	public getInstance() {
		const dynamodb = getDynamoInstance();
		const sns = new SNSAdapter();

		const productRepository = new ProductRepositoryDynamoDB(dynamodb);
		const saleRepository = new SaleRepositoryDynamoDB(dynamodb);

		const pixManager = new GerenciarnetManager();

		return new SaleUseCaseImplementation(
			saleRepository,
			productRepository,
			sns,
			pixManager,
		);
	}
}
