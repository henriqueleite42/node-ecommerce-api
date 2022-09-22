/* eslint-disable @typescript-eslint/naming-convention */

import { QueryCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import type {
	CounterEntity,
	CounterRepository,
	GetTopProductsOutput,
	GetTopStoresOutput,
	IncrementProductInput,
	IncrementStoreInput,
} from "models/counters";

import { DynamodbRepository } from ".";

export interface CounterTable {
	pk: string;
	sk: string;
	count: number;
}

export class CounterRepositoryDynamoDB
	extends DynamodbRepository<CounterTable, CounterEntity>
	implements CounterRepository
{
	protected readonly tableName = "counters";

	protected readonly topLength = 5;

	public async incrementStore({ storeId, qtd, type }: IncrementStoreInput) {
		await this.dynamodb.send(
			new UpdateItemCommand({
				TableName: this.tableName,
				UpdateExpression: "SET #count = #count + :count",
				ExpressionAttributeNames: {
					"#count": "count",
				},
				ExpressionAttributeValues: marshall({
					":count": qtd,
				}),
				Key: marshall({
					pk: `STORE#${storeId}`,
					sk: type,
				}),
			}),
		);
	}

	public async incrementProduct({
		storeId,
		productId,
		qtd,
		type,
	}: IncrementProductInput) {
		await this.dynamodb.send(
			new UpdateItemCommand({
				TableName: this.tableName,
				UpdateExpression: "SET #count = #count + :count",
				ExpressionAttributeNames: {
					"#count": "count",
				},
				ExpressionAttributeValues: marshall({
					":count": qtd,
				}),
				Key: marshall({
					pk: `PRODUCT#${productId}#STORE#${storeId}`,
					sk: type,
				}),
			}),
		);
	}

	public async getTopStores() {
		const result = await this.dynamodb.send(
			new QueryCommand(this.indexTopStores()),
		);

		return (
			result.Items?.map(item =>
				this.tableToStore(unmarshall(item) as CounterTable),
			) || []
		);
	}

	public async getTopProducts() {
		const result = await this.dynamodb.send(
			new QueryCommand(this.indexTopProducts()),
		);

		return (
			result.Items?.map(item =>
				this.tableToProduct(unmarshall(item) as CounterTable),
			) || []
		);
	}

	// Keys

	private indexTopStores() {
		return {
			TableName: this.tableName,
			IndexName: "PkCount",
			Limit: this.topLength,
			KeyConditionExpression: "#pk = :pk",
			ExpressionAttributeNames: {
				"#pk": "pk",
			},
			ExpressionAttributeValues: marshall({
				":pk": "TOTAL_RECEIVED#STORE#",
			}),
			Key: marshall({
				pk: "TOTAL_RECEIVED#STORE#",
			}),
		};
	}

	private indexTopProducts() {
		return {
			TableName: this.tableName,
			IndexName: "PkCount",
			Limit: this.topLength,
			KeyConditionExpression: "#pk = :pk",
			ExpressionAttributeNames: {
				"#pk": "pk",
			},
			ExpressionAttributeValues: marshall({
				":pk": "TOTAL_RECEIVED#PRODUCT#",
			}),
			Key: marshall({
				pk: "TOTAL_RECEIVED#PRODUCT#",
			}),
		};
	}

	// Mappers

	protected tableToStore(table: CounterTable): GetTopStoresOutput {
		const [, , storeId] = table.pk.split("#");

		return {
			storeId,
			count: table.count,
		};
	}

	protected tableToProduct(table: CounterTable): GetTopProductsOutput {
		const [, , productId, , storeId] = table.pk.split("#");

		return {
			productId,
			storeId,
			count: table.count,
		};
	}

	protected entityToTable(): CounterTable {
		throw new Error("NOT_IMPLEMENTED");
	}

	protected tableToEntity(): CounterEntity {
		throw new Error("NOT_IMPLEMENTED");
	}
}
