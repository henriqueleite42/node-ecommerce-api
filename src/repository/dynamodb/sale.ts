/* eslint-disable @typescript-eslint/naming-convention */

import {
	BatchWriteItemCommand,
	PutItemCommand,
	QueryCommand,
	UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { cleanObj } from "@techmmunity/utils";
import { v4 } from "uuid";

import type {
	SaleEntity,
	SaleRepository,
	CreateInput,
	EditInput,
	GetByIdInput,
	GetByClientIdStatusInput,
	GetByStoreIdStatusInput,
	GetExpiredInput,
	BulkEditInput,
	EditSaleProductInput,
} from "../../models/sale";

import { DynamodbRepository } from ".";

import { SalesStatusEnum } from "../../types/enums/sale-status";

export interface SaleTable {
	saleId: string;
	storeId: string;
	clientId: string;
	origin: string;
	status: SalesStatusEnum;
	products: SaleEntity["products"];
	originalValue: number;
	finalValue?: number;
	createdAt: string;
	expiresAt: string;

	storeId_clientId: string;
	createdAt_saleId: string;
	status_createdAt: string;
	status_createdAt_saleId: string;
	expiresAt_saleId: string;
}

export class SaleRepositoryDynamoDB
	extends DynamodbRepository<SaleTable, SaleEntity>
	implements SaleRepository
{
	protected readonly tableName = "sales";

	public async create(data: CreateInput) {
		const item: SaleEntity = {
			...data,
			finalValue: data.products.reduce(
				(acc, cur) => acc + cur.originalPrice,
				0,
			),
			status: SalesStatusEnum.IN_CART,
			saleId: v4(),
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

	public edit({ saleId, ...data }: EditInput) {
		return this.update(this.indexSaleId({ saleId }), data);
	}

	public async editSaleProduct({
		saleId,
		productIndex,
		delivered,
	}: EditSaleProductInput) {
		const result = await this.dynamodb.send(
			new UpdateItemCommand({
				TableName: this.tableName,
				UpdateExpression: `SET #products[${productIndex}].#delivered = :delivered`,
				ExpressionAttributeNames: {
					"#products": "products",
					"#delivered": "delivered",
				},
				ExpressionAttributeValues: marshall({
					":delivered": Boolean(delivered),
				}),
				Key: marshall({
					saleId: `SALE#${saleId}`,
				}),
				ReturnValues: "ALL_NEW",
			}),
		);

		return result.Attributes
			? this.tableToEntity(unmarshall(result.Attributes) as SaleTable)
			: undefined;
	}

	public async bulkEdit({ salesIds, data }: BulkEditInput) {
		await this.dynamodb.send(
			new BatchWriteItemCommand({
				RequestItems: {
					[this.tableName]: salesIds.map(saleId => ({
						PutRequest: {
							Item: marshall({
								saleId,
								...data,
							}),
						},
					})),
				},
			}),
		);
	}

	public getById({ saleId }: GetByIdInput) {
		return this.getSingleItem(this.indexSaleId({ saleId }));
	}

	public getByClientIdStatus({
		limit,
		continueFrom,
		...keys
	}: GetByClientIdStatusInput) {
		return this.getMultipleItems(
			this.indexClientIdStatus(keys),
			limit,
			continueFrom,
		);
	}

	public getByStoreIdStatus({
		limit,
		continueFrom,
		...keys
	}: GetByStoreIdStatusInput) {
		return this.getMultipleItems(
			this.indexStoreIdStatus(keys),
			limit,
			continueFrom,
		);
	}

	public async getExpired({ continueFrom }: GetExpiredInput) {
		const result = await this.dynamodb.send(
			new QueryCommand({
				TableName: this.tableName,
				Limit: 100,
				IndexName: "StatusExpiresAtSaleId",
				KeyConditionExpression:
					"#status = :status AND begins_with(#expiresAt_saleId, :expiresAt_saleId)",
				ExpressionAttributeNames: {
					"#status": "status",
					"#expiresAt_saleId": "expiresAt_saleId",
				},
				ExpressionAttributeValues: marshall({
					":status": SalesStatusEnum.PENDING,
					":expiresAt_saleId": new Date().toISOString(),
				}),
				ExclusiveStartKey: this.getExclusiveStartKey(continueFrom),
			}),
		);

		if (!result.Items || result.Items.length === 0) {
			return {
				items: [] as Array<SaleEntity>,
			};
		}

		const items = result.Items.map(i =>
			this.tableToEntity(unmarshall(i) as SaleTable),
		);

		return {
			items,
			nextPage: result.LastEvaluatedKey
				? this.toCursor(result.LastEvaluatedKey)
				: undefined,
		};
	}

	// Keys

	private indexSaleId(entity: Pick<SaleEntity, "saleId">) {
		return {
			IndexName: "SaleId",
			KeyConditionExpression: "#saleId = :saleId",
			ExpressionAttributeNames: {
				"#saleId": "saleId",
			},
			ExpressionAttributeValues: marshall({
				":saleId": `SALE#${entity.saleId}`,
			}),
			Key: marshall({
				saleId: `SALE#${entity.saleId}`,
			}),
		};
	}

	private indexClientIdStatus(entity: Pick<SaleEntity, "clientId" | "status">) {
		return {
			IndexName: "ClientIdStatus",
			KeyConditionExpression:
				"#clientId = :clientId AND begins_with(#status, :status)",
			ExpressionAttributeNames: {
				"#clientId": "clientId",
				"#status": "status",
			},
			ExpressionAttributeValues: marshall({
				":clientId": `CLIENT#${entity.clientId}`,
				":status": `STATUS#${entity.status}`,
			}),
			Key: marshall({
				clientId: `CLIENT#${entity.clientId}`,
				status: `STATUS#${entity.status}`,
			}),
		};
	}

	private indexStoreIdStatus(entity: Pick<SaleEntity, "status" | "storeId">) {
		return {
			IndexName: "StoreIdStatus",
			KeyConditionExpression:
				"#storeId = :storeId AND begins_with(#status, :status)",
			ExpressionAttributeNames: {
				"#storeId": "storeId",
				"#status": "status",
			},
			ExpressionAttributeValues: marshall({
				":storeId": `CLIENT#${entity.storeId}`,
				":status": `STATUS#${entity.status}`,
			}),
			Key: marshall({
				storeId: `CLIENT#${entity.storeId}`,
				status: `STATUS#${entity.status}`,
			}),
		};
	}

	// Mappers

	protected entityToTable(entity: Partial<SaleEntity>): Partial<SaleTable> {
		return cleanObj({
			saleId: entity.saleId ? `SALE#${entity.saleId}` : undefined,
			storeId: entity.storeId ? `ACCOUNT#${entity.storeId}` : undefined,
			clientId: entity.clientId ? `ACCOUNT#${entity.clientId}` : undefined,
			origin: entity.origin,
			status: entity.status,
			products: entity.products,
			finalPrice: entity.finalValue,
			createdAt: entity.createdAt?.toISOString(),

			storeId_clientId:
				entity.storeId && entity.clientId
					? `STORE#${entity.storeId}#CLIENT#${entity.clientId}`
					: undefined,
			status_createdAt:
				entity.status && entity.createdAt
					? `STATUS#${
							entity.status
					  }#CREATED_AT#${entity.createdAt.toISOString()}`
					: undefined,
			createdAt_saleId:
				entity.createdAt && entity.saleId
					? `${entity.createdAt.toISOString()}#SALE#${entity.saleId}`
					: undefined,
			status_createdAt_saleId:
				entity.status && entity.createdAt && entity.saleId
					? `STATUS#${
							entity.status
					  }#CREATED_AT#${entity.createdAt.toISOString()}#SALE#${
							entity.saleId
					  }`
					: undefined,
			expiresAt_saleId:
				entity.expiresAt && entity.saleId
					? `${entity.expiresAt}#SALE#${entity.saleId}`
					: undefined,
		});
	}

	protected tableToEntity(table: SaleTable): SaleEntity {
		return {
			saleId: table.saleId.replace("SALE#$", ""),
			storeId: table.storeId.replace("ACCOUNT#$", ""),
			clientId: table.clientId.replace("ACCOUNT#$", ""),
			origin: table.origin,
			status: table.status,
			products: table.products,
			finalValue: table.finalValue,
			originalValue: table.originalValue,
			createdAt: new Date(table.createdAt),
			expiresAt: new Date(table.expiresAt),
		};
	}
}
