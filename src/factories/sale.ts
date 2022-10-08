import { GerenciarnetManager } from "../adapters/implementations/gerencianet";
import { SNSAdapter } from "../adapters/implementations/sns";
import type { SaleUseCase } from "../models/sale";
import { getDynamoInstance } from "../repository/dynamodb";
import { BlacklistRepositoryDynamoDB } from "../repository/dynamodb/blacklist";
import { CouponRepositoryDynamoDB } from "../repository/dynamodb/coupon";
import { ProductRepositoryDynamoDB } from "../repository/dynamodb/product";
import { SaleRepositoryDynamoDB } from "../repository/dynamodb/sale";
import { SaleUseCaseImplementation } from "../usecase/sale";

import { Service } from ".";

let instance: SaleUseCaseImplementation;

export class SaleService extends Service<SaleUseCase> {
	public getInstance() {
		if (instance) return instance;

		const dynamodb = getDynamoInstance();
		const sns = new SNSAdapter();

		const productRepository = new ProductRepositoryDynamoDB(dynamodb);
		const couponRepository = new CouponRepositoryDynamoDB(dynamodb);
		const blacklistRepository = new BlacklistRepositoryDynamoDB(dynamodb);
		const saleRepository = new SaleRepositoryDynamoDB(dynamodb);

		const pixManager = new GerenciarnetManager();

		const newInstance = new SaleUseCaseImplementation(
			saleRepository,
			blacklistRepository,
			productRepository,
			couponRepository,
			sns,
			pixManager,
		);

		instance = newInstance;

		return instance;
	}
}
