import type {
	ChangeVisibilityInput,
	CreateFeedbackInput,
	FeedbackRepository,
	FeedbackUseCase,
	GetManyInput,
} from "../models/feedback";
import type { SaleUseCase } from "../models/sale";

import { CustomError } from "../utils/error";

import { FeedbackTypeEnum } from "../types/enums/feedback-type";
import { StatusCodeEnum } from "../types/enums/status-code";

export class FeedbackUseCaseImplementation implements FeedbackUseCase {
	public constructor(
		private readonly feedbackRepository: FeedbackRepository,

		private readonly saleUsecase: SaleUseCase,
	) {}

	public async create({
		accountId,
		saleId,
		feedback,
		type,
	}: CreateFeedbackInput) {
		const sale = await this.saleUsecase.getById({ saleId }).catch();

		if (!sale) {
			throw new CustomError("Sale not found", StatusCodeEnum.NOT_FOUND);
		}

		if (accountId !== sale.clientId) {
			throw new CustomError(
				"Only the person that did the purchase can give a feedback",
				StatusCodeEnum.UNAUTHORIZED,
			);
		}

		const existentFeedback = await this.feedbackRepository.getOne({
			feedbackId: saleId,
		});

		if (existentFeedback) {
			throw new CustomError(
				"Only one feedback per sale is allowed",
				StatusCodeEnum.UNAUTHORIZED,
			);
		}

		const [product] = sale.products;

		return this.feedbackRepository.create({
			feedbackId: saleId,
			feedback,
			type,
			display: type === FeedbackTypeEnum.POSITIVE,
			storeId: sale.storeId,
			store: {
				name: sale.store.name,
				gender: sale.store.gender,
				avatarUrl: sale.store.avatarUrl,
				bannerUrl: sale.store.bannerUrl,
			},
			productId: product.productId,
			product: {
				name: product.name,
				type: product.type,
				price: product.originalPrice,
				imageUrl: product.imageUrl,
			},
		});
	}

	public async changeVisibility({ accountId, ...p }: ChangeVisibilityInput) {
		const existentFeedback = await this.feedbackRepository.getOne({
			feedbackId: p.feedbackId,
		});

		if (!existentFeedback) {
			throw new CustomError("Feedback not found", StatusCodeEnum.NOT_FOUND);
		}

		if (accountId !== existentFeedback.storeId) {
			throw new CustomError(
				"Only the store can change the feedback visibility",
				StatusCodeEnum.UNAUTHORIZED,
			);
		}

		await this.feedbackRepository.edit(p);
	}

	public getMany(p: GetManyInput) {
		return this.feedbackRepository.getMany(p);
	}
}
