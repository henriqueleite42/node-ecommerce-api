import type { PaginatedItems } from "./types";

import type { FeedbackTypeEnum } from "../types/enums/feedback-type";
import type { GenderEnum } from "../types/enums/gender";
import type { ProductTypeEnum } from "../types/enums/product-type";

export interface FeedbackEntity {
	feedbackId: string; // Same as saleId, so we can keep it 1x1
	type: FeedbackTypeEnum;
	display: boolean;
	feedback: string;
	storeId: string;
	store: {
		name: string;
		gender: GenderEnum;
		avatarUrl?: string;
		bannerUrl?: string;
	};
	productId: string;
	product: {
		name: string;
		type: ProductTypeEnum;
		price: number;
		imageUrl?: string;
	};
	createdAt: Date;
}

/**
 *
 *
 * Repository
 *
 *
 */

export interface CreateInput {
	feedbackId: string;
	type: FeedbackTypeEnum;
	display: boolean;
	feedback: string;
	storeId: string;
	store: {
		name: string;
		gender: GenderEnum;
		avatarUrl?: string;
		bannerUrl?: string;
	};
	productId: string;
	product: {
		name: string;
		type: ProductTypeEnum;
		price: number;
		imageUrl?: string;
	};
}

export interface EditInput {
	feedbackId: string;
	display?: boolean;
	store?: {
		name: string;
		gender: GenderEnum;
		avatarUrl?: string;
		bannerUrl?: string;
	};
	product?: {
		name: string;
		type: ProductTypeEnum;
		price: number;
		imageUrl?: string;
	};
}

export interface GetOneInput {
	feedbackId: string;
}

export interface GetManyInput {
	storeId: string;
	limit: number;
	cursor: string;
}

export interface FeedbackRepository {
	create: (p: CreateInput) => Promise<FeedbackEntity>;

	edit: (p: EditInput) => Promise<FeedbackEntity | null>;

	getOne: (p: GetOneInput) => Promise<FeedbackEntity | null>;

	getMany: (p: GetManyInput) => Promise<PaginatedItems<FeedbackEntity>>;
}

/**
 *
 *
 * Usecase
 *
 *
 */

export interface CreateFeedbackInput {
	type: FeedbackTypeEnum;
	accountId: string;
	feedback: string;
	saleId: string;
}

export interface ChangeVisibilityInput {
	accountId: string;
	feedbackId: string;
	display: boolean;
}

export interface FeedbackUseCase {
	create: (p: CreateFeedbackInput) => Promise<FeedbackEntity>;

	changeVisibility: (p: ChangeVisibilityInput) => Promise<void>;

	getMany: (p: GetManyInput) => Promise<PaginatedItems<FeedbackEntity>>;
}
