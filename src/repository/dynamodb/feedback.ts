/* eslint-disable @typescript-eslint/naming-convention */

import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { cleanObj } from "@techmmunity/utils";

import type {
	CreateInput,
	EditInput,
	FeedbackEntity,
	FeedbackRepository,
	GetManyInput,
	GetOneInput,
} from "../../models/feedback";

import { DynamodbRepository } from ".";

import type { FeedbackTypeEnum } from "../../types/enums/feedback-type";
import type { GenderEnum } from "../../types/enums/gender";
import type { ProductTypeEnum } from "../../types/enums/product-type";

export interface FeedbackTable {
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
	createdAt: string;

	display_feedbackId: string;
}

export class FeedbackRepositoryDynamoDB
	extends DynamodbRepository<FeedbackTable, FeedbackEntity>
	implements FeedbackRepository
{
	protected readonly tableName = "feedbacks";

	public async create(p: CreateInput) {
		const item: FeedbackEntity = {
			...p,
			createdAt: new Date(),
		};

		await this.dynamodb.send(
			new PutItemCommand({
				// eslint-disable-next-line @typescript-eslint/naming-convention
				TableName: this.tableName,
				// eslint-disable-next-line @typescript-eslint/naming-convention
				Item: marshall(this.entityToTable(item)),
			}),
		);

		return item;
	}

	public edit({ feedbackId, ...data }: EditInput) {
		return this.update(this.indexMain({ feedbackId }).Key, data);
	}

	public getOne(keys: GetOneInput) {
		return this.getSingleItem(this.indexMain(keys).Key);
	}

	public getMany({ storeId, limit, cursor }: GetManyInput) {
		return this.getMultipleItems(
			this.indexStoreIdDisplay({
				storeId,
				display: true,
			}),
			limit,
			cursor,
		);
	}

	// Keys

	private indexMain({ feedbackId }: Pick<FeedbackEntity, "feedbackId">) {
		return {
			KeyConditionExpression: "#feedbackId = :feedbackId",
			ExpressionAttributeNames: {
				"#feedbackId": "feedbackId",
			},
			ExpressionAttributeValues: marshall({
				":feedbackId": `FEEDBACK#${feedbackId}`,
			}),
			Key: marshall({
				feedbackId: `FEEDBACK#${feedbackId}`,
			}),
		};
	}

	private indexStoreIdDisplay({
		storeId,
		display,
	}: Pick<FeedbackEntity, "display" | "storeId">) {
		return {
			IndexName: "StoreId",
			KeyConditionExpression:
				"#storeId = :storeId AND begins_with(#display, :display)",
			ExpressionAttributeNames: {
				"#storeId": "storeId",
				"#display": "display",
			},
			ExpressionAttributeValues: marshall({
				":storeId": `STORE#${storeId}`,
				":display": `DISPLAY#${display.toString()}`,
			}),
		};
	}

	// Mappers

	protected entityToTable(
		entity: Partial<FeedbackEntity>,
	): Partial<FeedbackTable> {
		const feedbackId = entity.feedbackId
			? `FEEDBACK#${entity.feedbackId}`
			: undefined;

		return cleanObj({
			feedbackId,
			type: entity.type,
			display: entity.display,
			feedback: entity.feedback,
			storeId: entity.storeId ? `STORE#${entity.storeId}` : undefined,
			store: entity.store,
			productId: entity.productId ? `PRODUCT#${entity.productId}` : undefined,
			product: entity.product,
			createdAt: entity.createdAt?.toISOString(),

			display_feedbackId:
				typeof entity.display === "boolean" && feedbackId
					? `DISPLAY#${entity.display.toString()}#FEEDBACK#${feedbackId}`
					: undefined,
		});
	}

	protected tableToEntity(table: FeedbackTable): FeedbackEntity {
		return {
			feedbackId: table.feedbackId.replace("FEEDBACK#", ""),
			type: table.type,
			display: table.display,
			feedback: table.feedback,
			storeId: table.storeId.replace("STORE#", ""),
			store: table.store,
			productId: table.productId.replace("PRODUCT#", ""),
			product: table.product,
			createdAt: new Date(table.createdAt),
		};
	}
}
