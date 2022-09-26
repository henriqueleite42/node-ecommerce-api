/* eslint-disable @typescript-eslint/naming-convention */

import { BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { cleanObj } from "@techmmunity/utils";

import type {
	ContentEntity,
	ContentRepository,
	CreateManyInput,
	EditInput,
} from "../../models/content";

import { DynamodbRepository } from ".";

import { genCode } from "../../utils/id/gen-code";

import type { MediaTypeEnum } from "../../types/enums/media-type";

export interface ContentTable {
	contentId: string;
	productId: string;
	storeId: string;
	type: MediaTypeEnum;
	rawContentPath?: string;
	processedContentPath?: string;
	createdAt: string;

	storeId_productId: string;
	createdAt_contentId: string;
	storeId_productId_contentId: string;
}

export class ContentRepositoryDynamoDB
	extends DynamodbRepository<ContentTable, ContentEntity>
	implements ContentRepository
{
	protected readonly tableName = "contents";

	public async createMany({ storeId, productId, contents }: CreateManyInput) {
		const createdAt = new Date();

		const items: Array<ContentEntity> = contents.map(c => ({
			contentId: genCode(),
			productId,
			storeId,
			type: c.type,
			createdAt,
		}));

		const itemsTable = items.map(i => this.entityToTable(i));

		const result = await this.dynamodb.send(
			new BatchWriteItemCommand({
				RequestItems: {
					[this.tableName]: itemsTable.map(i => ({
						PutRequest: {
							Item: marshall(i),
						},
					})),
				},
			}),
		);

		if ((result.UnprocessedItems?.[this.tableName].length || 0) > 0) {
			await this.dynamodb.send(
				new BatchWriteItemCommand({
					RequestItems: {
						[this.tableName]: itemsTable.map(i => ({
							DeleteRequest: {
								Key: marshall({
									storeId_productId_contentId: i.storeId_productId_contentId,
								}),
							},
						})),
					},
				}),
			);

			throw new Error("Fail to create contents");
		}

		return items;
	}

	public edit({ storeId, productId, contentId, ...data }: EditInput) {
		return this.update(
			this.indexStoreIdProductIdContentId({
				storeId,
				productId,
				contentId,
			}).Key,
			data,
		);
	}

	// Keys

	private indexStoreIdProductIdContentId({
		storeId,
		productId,
		contentId,
	}: Pick<ContentEntity, "contentId" | "productId" | "storeId">) {
		return {
			IndexName: "StoreIdProductIdContentId",
			KeyConditionExpression:
				"#storeId_productId_contentId = :storeId_productId_contentId",
			ExpressionAttributeNames: {
				"#storeId_productId_contentId": "storeId_productId_contentId",
			},
			ExpressionAttributeValues: marshall({
				":storeId_productId_contentId": `STORE#${storeId}#PRODUCT#${productId}#CONTENT#${contentId}`,
			}),
			Key: marshall({
				storeId_productId_contentId: `STORE#${storeId}#PRODUCT#${productId}#CONTENT#${contentId}`,
			}),
		};
	}

	// Mappers

	protected entityToTable(entity: ContentEntity): ContentTable {
		const contentId = `CONTENT#${entity.contentId}`;
		const productId = `PRODUCT#${entity.productId}`;
		const storeId = `STORE#${entity.storeId}`;
		const createdAt = entity.createdAt.toISOString();

		return cleanObj({
			contentId,
			productId,
			storeId,
			type: entity.type,
			rawContentPath: entity.rawContentPath,
			processedContentPath: entity.processedContentPath,
			createdAt,

			storeId_productId: `${storeId}#${productId}`,
			createdAt_contentId: `${createdAt}#${contentId}`,
			storeId_productId_contentId: `${storeId}#${productId}#${contentId}`,
		});
	}

	protected tableToEntity(table: ContentTable): ContentEntity {
		return {
			contentId: table.contentId.replace("CONTENT#", ""),
			productId: table.productId.replace("PRODUCT#", ""),
			storeId: table.storeId.replace("STORE#", ""),
			type: table.type as MediaTypeEnum,
			rawContentPath: table.rawContentPath,
			processedContentPath: table.processedContentPath,
			createdAt: new Date(table.createdAt),
		};
	}
}
