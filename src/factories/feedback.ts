import type { FeedbackUseCase } from "../models/feedback";
import { getDynamoInstance } from "../repository/dynamodb";
import { FeedbackRepositoryDynamoDB } from "../repository/dynamodb/feedback";
import { FeedbackUseCaseImplementation } from "../usecase/feedback";

import { Service } from ".";
import { SaleService } from "./sale";

let instance: FeedbackUseCaseImplementation;

export class FeedbackService extends Service<FeedbackUseCase> {
	public getInstance() {
		if (instance) return instance;

		const dynamodb = getDynamoInstance();

		const feedbackRepository = new FeedbackRepositoryDynamoDB(dynamodb);

		const saleUsecase = new SaleService().getInstance();

		const newInstance = new FeedbackUseCaseImplementation(
			feedbackRepository,
			saleUsecase,
		);

		instance = newInstance;

		return instance;
	}
}
