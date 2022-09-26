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
	createdAt: string;
	expiresAt?: string;

	accountId_storeId_productId_variationId: string;
	accountId_storeId: string;
	createdAt_productId_variationId: string;
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

		if ((result.UnprocessedItems?.[this.tableName].length || 0) > 0) {
			await this.dynamodb.send(
				new BatchWriteItemCommand({
					RequestItems: {
						[this.tableName]: itemsTable.map(i => ({
							DeleteRequest: {
								Key: marshall({
									accountId_storeId_productId_variationId:
										i.accountId_storeId_productId_variationId,
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
			"accountId" | "productId" | "storeId" | "variationId"
		>,
	) {
		const accountId = `ACCOUNT#${entity.accountId}`;
		const storeId = `STORE#${entity.storeId}`;
		const productId = `PRODUCT#${entity.productId}`;
		const variationId = `VARIATION#${entity.variationId || ""}`;

		const key = `${accountId}#${storeId}#${productId}#${variationId}`;

		return {
			IndexName: "AccountIdStoreIdProductIdVariationId",
			KeyConditionExpression:
				"#accountId_storeId_productId_variationId = :accountId_storeId_productId_variationId",
			ExpressionAttributeNames: {
				"#accountId_storeId_productId_variationId":
					"accountId_storeId_productId_variationId",
			},
			ExpressionAttributeValues: marshall({
				":accountId_storeId_productId_variationId": key,
			}),
			Key: marshall({
				accountId_storeId_productId_variationId: key,
			}),
		};
	}

	// Mappers

	protected entityToTable(entity: AccessEntity): AccessTable {
		const accountId = `ACCOUNT#${entity.accountId}`;
		const storeId = `STORE#${entity.storeId}`;
		const productId = `PRODUCT#${entity.productId}`;
		const variationId = `VARIATION#${entity.variationId || ""}`;
		const createdAt = entity.createdAt.toISOString();

		const primaryKey = `${accountId}#${storeId}#${productId}#${variationId}`;

		return cleanObj({
			accountId,
			storeId,
			productId,
			variationId,
			createdAt,
			expiresAt: entity.expiresAt?.toISOString(),

			accountId_storeId_productId_variationId: primaryKey,
			accountId_storeId: `${accountId}#${storeId}`,
			createdAt_productId_variationId: `${createdAt}#${primaryKey}#${variationId}`,
		});
	}

	protected tableToEntity(table: AccessTable): AccessEntity {
		return {
			accountId: table.accountId.replace("ACCOUNT#", ""),
			storeId: table.storeId.replace("STORE#", ""),
			productId: table.productId.replace("PRODUCT#", ""),
			variationId: table.variationId?.replace("VARIATION#", ""),
			createdAt: new Date(table.createdAt),
			expiresAt: table.expiresAt ? new Date(table.expiresAt) : undefined,
		};
	}
}
