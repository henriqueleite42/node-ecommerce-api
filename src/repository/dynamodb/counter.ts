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
		const stores = [] as Array<GetTopStoresOutput>;

		let nextPageCursor: any;

		do {
			// eslint-disable-next-line no-await-in-loop
			const result = await this.dynamodb.send(
				new QueryCommand(this.indexTopStores(nextPageCursor)),
			);

			result.Items?.forEach(item => {
				stores.push(this.tableToStore(unmarshall(item) as CounterTable));
			});

			nextPageCursor = result.LastEvaluatedKey;
		} while (nextPageCursor);

		const sortedStores = stores.sort((a, b) => a.count - b.count);

		return sortedStores.slice(0, this.topLength);
	}

	public async getTopProducts() {
		const products = [] as Array<GetTopProductsOutput>;

		let nextPageCursor: any;

		do {
			// eslint-disable-next-line no-await-in-loop
			const result = await this.dynamodb.send(
				new QueryCommand(this.indexTopProducts(nextPageCursor)),
			);

			result.Items?.forEach(item => {
				products.push(this.tableToProduct(unmarshall(item) as CounterTable));
			});

			nextPageCursor = result.LastEvaluatedKey;
		} while (nextPageCursor);

		const sortedProducts = products.sort((a, b) => a.count - b.count);

		return sortedProducts.slice(0, this.topLength);
	}

	// Keys

	private indexTopStores(cursor: Record<string, any> | undefined) {
		return {
			TableName: this.tableName,
			IndexName: "SkPk",
			Limit: 100,
			ExclusiveStartKey: cursor,
			KeyConditionExpression: "#sk = :sk AND begins_with(#pk, :pk)",
			ExpressionAttributeNames: {
				"#sk": "sk",
				"#pk": "pk",
			},
			ExpressionAttributeValues: marshall({
				":sk": "TOTAL_RECEIVED",
				":pk": "STORE#",
			}),
			Key: marshall({
				sk: "TOTAL_RECEIVED",
				pk: "STORE#",
			}),
		};
	}

	private indexTopProducts(cursor: Record<string, any> | undefined) {
		return {
			TableName: this.tableName,
			IndexName: "SkPk",
			Limit: 100,
			ExclusiveStartKey: cursor,
			KeyConditionExpression: "#sk = :sk AND begins_with(#pk, :pk)",
			ExpressionAttributeNames: {
				"#sk": "sk",
				"#pk": "pk",
			},
			ExpressionAttributeValues: marshall({
				":sk": "TOTAL_RECEIVED",
				":pk": "PRODUCT#",
			}),
			Key: marshall({
				sk: "TOTAL_RECEIVED",
				pk: "PRODUCT#",
			}),
		};
	}

	// Mappers

	protected tableToStore(table: CounterTable): GetTopStoresOutput {
		const [, storeId] = table.pk.split("#");

		return {
			storeId,
			count: table.count,
		};
	}

	protected tableToProduct(table: CounterTable): GetTopProductsOutput {
		const [, productId, , storeId] = table.pk.split("#");

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
