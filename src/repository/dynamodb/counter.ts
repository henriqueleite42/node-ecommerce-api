/* eslint-disable capitalized-comments */
/* eslint-disable @typescript-eslint/naming-convention */

import {
	GetItemCommand,
	QueryCommand,
	UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

import type {
	CounterRepository,
	GetTopProductsOutput,
	GetTopStoresOutput,
	IncrementProductInput,
	IncrementStoreInput,
	TotalCounterTypes,
} from "../../models/counter";

import { DynamodbRepository } from ".";

/**
 * pk: SOLD_AMOUNT#STORE
 * sk: STORE#{storeId}
 * count
 *
 * pk: TOTAL_BILLED#STORE
 * sk: STORE#{storeId}
 * count
 *
 * pk: SOLD_AMOUNT#PRODUCT
 * sk: PRODUCT#{productId}#STORE#{storeId}
 * count
 *
 * pk: TOTAL_BILLED#PRODUCT
 * sk: PRODUCT#{productId}#STORE#{storeId}
 * count
 *
 * pk: TOTAL
 * sk: STORES
 * count
 */
export interface CounterTable {
	pk: string;
	sk: string;
	count: number;
}

export class CounterRepositoryDynamoDB
	extends DynamodbRepository<CounterTable, undefined>
	implements CounterRepository
{
	protected readonly tableName = "counters";

	protected readonly topLength = 5;

	public async incrementStore({ storeId, qtd, type }: IncrementStoreInput) {
		await this.dynamodb.send(
			new UpdateItemCommand({
				TableName: this.tableName,
				...this.updateExpression(qtd),
				Key: marshall({
					pk: `${type}#STORE`,
					sk: `STORE#${storeId}`,
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
				...this.updateExpression(qtd),
				Key: marshall({
					pk: `${type}#PRODUCT`,
					sk: `PRODUCT#${productId}#STORE#${storeId}`,
				}),
			}),
		);
	}

	public async incrementTotal(type: TotalCounterTypes) {
		await this.dynamodb.send(
			new UpdateItemCommand({
				TableName: this.tableName,
				// eslint-disable-next-line @typescript-eslint/no-magic-numbers
				...this.updateExpression(1),
				Key: marshall({
					pk: "TOTAL",
					sk: type,
				}),
			}),
		);
	}

	public async getTotal(type: TotalCounterTypes) {
		const item = await this.dynamodb.send(
			new GetItemCommand({
				TableName: this.tableName,
				Key: marshall({
					pk: "TOTAL",
					sk: type,
				}),
			}),
		);

		if (!item.Item) return 0;

		const { count } = unmarshall(item.Item) as CounterTable;

		return count;
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
			IndexName: "PkCounter",
			Limit: this.topLength,
			KeyConditionExpression: "#pk = :pk",
			ExpressionAttributeNames: {
				"#pk": "pk",
			},
			ExpressionAttributeValues: marshall({
				":pk": "TOTAL_BILLED#STORE",
			}),
		};
	}

	private indexTopProducts() {
		return {
			TableName: this.tableName,
			IndexName: "PkCounter",
			Limit: this.topLength,
			KeyConditionExpression: "#pk = :pk",
			ExpressionAttributeNames: {
				"#pk": "pk",
			},
			ExpressionAttributeValues: marshall({
				":pk": "TOTAL_BILLED#PRODUCT",
			}),
		};
	}

	private updateExpression(qtd: number) {
		return {
			UpdateExpression: "SET #count = #count + :count",
			ExpressionAttributeNames: {
				"#count": "count",
			},
			ExpressionAttributeValues: marshall({
				":count": qtd,
			}),
		};
	}

	// Mappers

	protected tableToStore(table: CounterTable): GetTopStoresOutput {
		const [, storeId] = table.sk.split("#");

		return {
			storeId,
			count: table.count,
		};
	}

	protected tableToProduct(table: CounterTable): GetTopProductsOutput {
		const [, productId, , storeId] = table.sk.split("#");

		return {
			productId,
			storeId,
			count: table.count,
		};
	}

	protected entityToTable(): CounterTable {
		throw new Error("NOT_IMPLEMENTED");
	}

	protected tableToEntity(): undefined {
		throw new Error("NOT_IMPLEMENTED");
	}
}
