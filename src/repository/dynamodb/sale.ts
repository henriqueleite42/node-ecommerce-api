/* eslint-disable @typescript-eslint/naming-convention */

import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
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
	finalPrice: number;
	createdAt: string;

	status_createdAt: string;
}

export class SaleRepositoryDynamoDB
	extends DynamodbRepository<SaleTable, SaleEntity>
	implements SaleRepository
{
	protected readonly tableName = "sales";

	public async create(data: CreateInput) {
		const item: SaleEntity = {
			...data,
			finalPrice: data.products.reduce((acc, cur) => acc + cur.price, 0),
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
			finalPrice: entity.finalPrice,
			createdAt: entity.createdAt?.toISOString(),

			status_createdAt:
				entity.status && entity.createdAt
					? `STATUS#${
							entity.status
					  }#CREATED_AT#${entity.createdAt.toISOString()}`
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
			finalPrice: table.finalPrice,
			createdAt: new Date(table.createdAt),
		};
	}
}
