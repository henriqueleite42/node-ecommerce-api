import { GerenciarnetManager } from "../adapters/implementations/gerencianet";
import { SNSAdapter } from "../adapters/implementations/sns";
import { SQSAdapter } from "../adapters/implementations/sqs";
import type { SaleUseCase } from "../models/sale";
import { getDynamoInstance } from "../repository/dynamodb";
import { AccountRepositoryDynamoDB } from "../repository/dynamodb/account";
import { BlacklistRepositoryDynamoDB } from "../repository/dynamodb/blacklist";
import { CouponRepositoryDynamoDB } from "../repository/dynamodb/coupon";
import { ProductRepositoryDynamoDB } from "../repository/dynamodb/product";
import { SaleRepositoryDynamoDB } from "../repository/dynamodb/sale";
import { SaleUseCaseImplementation } from "../usecase/sale";

import { Service } from ".";
import { AccountService } from "./account";

let instance: SaleUseCaseImplementation;

export class SaleService extends Service<SaleUseCase> {
	public getInstance() {
		if (instance) return instance;

		const dynamodb = getDynamoInstance();
		const sns = new SNSAdapter();
		const sqs = new SQSAdapter();

		const productRepository = new ProductRepositoryDynamoDB(dynamodb);
		const couponRepository = new CouponRepositoryDynamoDB(dynamodb);
		const blacklistRepository = new BlacklistRepositoryDynamoDB(dynamodb);
		const saleRepository = new SaleRepositoryDynamoDB(dynamodb);
		const accountRepository = new AccountRepositoryDynamoDB(dynamodb);

		const pixManager = new GerenciarnetManager();

		const accountUsecase = new AccountService().getInstance();

		const newInstance = new SaleUseCaseImplementation(
			saleRepository,
			blacklistRepository,
			productRepository,
			couponRepository,
			accountRepository,
			sns,
			sqs,
			pixManager,

			accountUsecase,
		);

		instance = newInstance;

		return instance;
	}
}
