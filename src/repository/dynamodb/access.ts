/* eslint-disable @typescript-eslint/naming-convention */

import { BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { cleanObj } from "@techmmunity/utils";

import type {
	AccessEntity,
	AccessIds,
	AccessRepository,
	CreateManyInput,
} from "../../models/access";

import { DynamodbRepository } from ".";

export interface AccessTable {
	accountId: string;
	storeId: string;
	productId: string;
	variationId?: string;
	contentId?: string;
	createdAt: string;

	pk: string;
	accountId_storeId: string;
	createdAt_sk: string;
}

export class AccessRepositoryDynamoDB
	extends DynamodbRepository<AccessTable, AccessEntity>
	implements AccessRepository
{
	protected readonly tableName = "accesses";

	public async createMany({ accountId, accesses }: CreateManyInput) {
		const createdAt = new Date();

		const items: Array<AccessEntity> = accesses.map(
			({ storeId, productId, variationId }) => ({
				accountId,
				productId,
				storeId,
				variationId,
				createdAt,
			}),
		);

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
									pk: i.pk,
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

	public get(keys: AccessIds) {
		return this.getSingleItem(
			this.indexAccountIdStoreIdProductIdVariationId(keys),
		);
	}

	// Keys

	private indexAccountIdStoreIdProductIdVariationId(
		entity: Pick<
			AccessEntity,
			"accountId" | "contentId" | "productId" | "storeId" | "variationId"
		>,
	) {
		const accountId = `ACCOUNT#${entity.accountId}`;
		const storeId = `STORE#${entity.storeId}`;
		const productId = `PRODUCT#${entity.productId}`;
		const variationId = entity.variationId
			? `VARIATION#${entity.variationId}`
			: undefined;
		const contentId = entity.contentId
			? `CONTENT#${entity.contentId}`
			: undefined;

		const pk = [accountId, storeId, productId, variationId, contentId]
			.filter(Boolean)
			.join("#");

		return {
			KeyConditionExpression: "#pk = :pk",
			ExpressionAttributeNames: {
				"#pk": "pk",
			},
			ExpressionAttributeValues: marshall({
				":pk": pk,
			}),
			Key: marshall({
				pk,
			}),
		};
	}

	// Mappers

	protected entityToTable(entity: Partial<AccessEntity>): Partial<AccessTable> {
		const accountId = entity.accountId
			? `ACCOUNT#${entity.accountId}`
			: undefined;
		const storeId = entity.storeId ? `STORE#${entity.storeId}` : undefined;
		const productId = entity.productId
			? `PRODUCT#${entity.productId}`
			: undefined;
		const variationId = entity.variationId
			? `VARIATION#${entity.variationId}`
			: undefined;
		const contentId = entity.contentId
			? `CONTENT#${entity.contentId}`
			: undefined;
		const createdAt = entity.createdAt?.toISOString();

		const pk =
			[accountId, storeId, productId, variationId, contentId]
				.filter(Boolean)
				.join("#") || undefined;

		const createdAt_sk =
			createdAt && productId
				? [createdAt, productId, variationId, contentId]
						.filter(Boolean)
						.join("#")
				: undefined;

		return cleanObj({
			accountId,
			storeId,
			productId,
			variationId,
			createdAt,

			pk,
			createdAt_sk,
			accountId_storeId:
				accountId && storeId ? `${accountId}#${storeId}` : undefined,
			createdAt_productId_variationId:
				createdAt && productId && variationId
					? `${createdAt}#${productId}#${variationId}`
					: undefined,
		});
	}

	protected tableToEntity(table: AccessTable): AccessEntity {
		return {
			accountId: table.accountId.replace("ACCOUNT#", ""),
			storeId: table.storeId.replace("STORE#", ""),
			productId: table.productId.replace("PRODUCT#", ""),
			variationId: table.variationId?.replace("VARIATION#", ""),
			contentId: table.contentId?.replace("CONTENT#", ""),
			createdAt: new Date(table.createdAt),
		};
	}
}
