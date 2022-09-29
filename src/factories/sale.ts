import { GerenciarnetManager } from "../adapters/implementations/gerencianet";
import { SNSAdapter } from "../adapters/implementations/sns";
import type { SaleUseCase } from "../models/sale";
import { getDynamoInstance } from "../repository/dynamodb";
import { BlacklistRepositoryDynamoDB } from "../repository/dynamodb/blacklist";
import { ProductRepositoryDynamoDB } from "../repository/dynamodb/product";
import { SaleRepositoryDynamoDB } from "../repository/dynamodb/sale";
import { SaleUseCaseImplementation } from "../usecase/sale";

import { Service } from ".";

export class SaleService extends Service<SaleUseCase> {
	public getInstance() {
		const dynamodb = getDynamoInstance();
		const sns = new SNSAdapter();

		const productRepository = new ProductRepositoryDynamoDB(dynamodb);
		const blacklistRepository = new BlacklistRepositoryDynamoDB(dynamodb);
		const saleRepository = new SaleRepositoryDynamoDB(dynamodb);

		const pixManager = new GerenciarnetManager();

		return new SaleUseCaseImplementation(
			saleRepository,
			blacklistRepository,
			productRepository,
			sns,
			pixManager,
		);
	}
}
