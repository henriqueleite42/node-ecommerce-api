/* eslint-disable @typescript-eslint/naming-convention */

import { BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { cleanObj } from "@techmmunity/utils";

import type {
	ContentEntity,
	ContentRepository,
	CreateManyInput,
	EditInput,
	GetContentInput,
	GetFromProductInput,
} from "../../models/content";

import { DynamodbRepository } from ".";

import { genCode } from "../../utils/id/gen-code";

import type { MediaTypeEnum } from "../../types/enums/media-type";

export interface ContentTable {
	contentId: string;
	productId: string;
	storeId: string;
	type: MediaTypeEnum;
	mediaPath?: string;
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

		if ((result.UnprocessedItems?.[this.tableName]?.length || 0) > 0) {
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
			this.indexMain({
				storeId,
				productId,
				contentId,
			}).Key,
			data,
		);
	}

	public getContent(keys: GetContentInput) {
		return this.getSingleItem(this.indexMain(keys));
	}

	public getFromProduct({ limit, cursor, ...keys }: GetFromProductInput) {
		return this.getMultipleItems(this.indexFromProduct(keys), limit, cursor);
	}

	// Keys

	private indexMain({
		storeId,
		productId,
		contentId,
	}: Pick<ContentEntity, "contentId" | "productId" | "storeId">) {
		return {
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

	private indexFromProduct({
		storeId,
		productId,
	}: Pick<ContentEntity, "productId" | "storeId">) {
		return {
			Index: "StoreIdProductIdCreatedAtContentId",
			KeyConditionExpression: "#storeId_productId = :storeId_productId",
			ExpressionAttributeNames: {
				"#storeId_productId": "storeId_productId",
			},
			ExpressionAttributeValues: marshall({
				":storeId_productId": `STORE#${storeId}#PRODUCT#${productId}`,
			}),
		};
	}

	// Mappers

	protected entityToTable(
		entity: Partial<ContentEntity>,
	): Partial<ContentTable> {
		const contentId = entity.contentId
			? `CONTENT#${entity.contentId}`
			: undefined;
		const productId = entity.productId
			? `PRODUCT#${entity.productId}`
			: undefined;
		const storeId = entity.storeId ? `STORE#${entity.storeId}` : undefined;
		const createdAt = entity.createdAt?.toISOString();

		return cleanObj({
			contentId,
			productId,
			storeId,
			type: entity.type,
			mediaPath: entity.mediaPath,
			createdAt,

			storeId_productId:
				storeId && productId ? `${storeId}#${productId}` : undefined,
			createdAt_contentId:
				createdAt && contentId ? `${createdAt}#${contentId}` : undefined,
			storeId_productId_contentId:
				storeId && productId && contentId
					? `${storeId}#${productId}#${contentId}`
					: undefined,
		});
	}

	protected tableToEntity(table: ContentTable): ContentEntity {
		return {
			contentId: table.contentId.replace("CONTENT#", ""),
			productId: table.productId.replace("PRODUCT#", ""),
			storeId: table.storeId.replace("STORE#", ""),
			type: table.type as MediaTypeEnum,
			mediaPath: table.mediaPath,
			createdAt: new Date(table.createdAt),
		};
	}
}
