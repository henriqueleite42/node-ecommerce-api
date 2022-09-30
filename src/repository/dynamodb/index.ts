/* eslint-disable @typescript-eslint/naming-convention */
import {
	BatchGetItemCommand,
	DynamoDBClient,
	QueryCommand,
	UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import type {
	DynamoDBClientConfig,
	QueryCommandInput,
	KeysAndAttributes,
	AttributeValue,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { cleanObj } from "@techmmunity/utils";
import { uid } from "uid/single";

export const getDynamoInstance = (config: DynamoDBClientConfig = {}) => {
	const { NODE_ENV } = process.env;

	if (NODE_ENV === "local") {
		return new DynamoDBClient(config);
	}

	return new DynamoDBClient(config);
};

export abstract class DynamodbRepository<TableType, EntityType> {
	protected tableName: string;

	public constructor(protected readonly dynamodb: DynamoDBClient) {}

	protected async getSingleItem(
		input: Omit<QueryCommandInput, "Limit" | "TableName">,
	) {
		const result = await this.dynamodb.send(
			new QueryCommand({
				TableName: this.tableName,
				Limit: 1,
				...input,
			}),
		);

		if (!result.Items || result.Items.length === 0) {
			return null;
		}

		return this.tableToEntity(unmarshall(result.Items[0]) as TableType);
	}

	protected async getMultipleItems(
		input: Omit<QueryCommandInput, "TableName">,
		limit: number,
		continueFrom?: string,
	) {
		const result = await this.dynamodb.send(
			new QueryCommand({
				TableName: this.tableName,
				Limit: limit,
				ExclusiveStartKey: this.getExclusiveStartKey(continueFrom),
				...input,
			}),
		);

		if (!result.Items) {
			return {
				items: [],
				curPage: continueFrom,
			};
		}

		return {
			items: result.Items.map(i =>
				this.tableToEntity(unmarshall(i) as TableType),
			),
			curPage: continueFrom,
			nextPage: result.LastEvaluatedKey
				? this.toCursor(result.LastEvaluatedKey)
				: undefined,
		};
	}

	protected async getMultipleItemsById(input: KeysAndAttributes) {
		const result = await this.dynamodb.send(
			new BatchGetItemCommand({
				RequestItems: {
					[this.tableName]: input,
				},
			}),
		);

		if (!result.Responses?.[this.tableName]) {
			return [];
		}

		return result.Responses?.[this.tableName].map(i =>
			this.tableToEntity(unmarshall(i) as TableType),
		);
	}

	protected async update(keys: Record<string, any>, data: Record<string, any>) {
		const dataToUpdate = cleanObj(data);

		const result = await this.dynamodb.send(
			new UpdateItemCommand({
				TableName: this.tableName,
				ReturnValues: "ALL_NEW",
				Key: keys,
				...this.getUpdateData(dataToUpdate),
			}),
		);

		if (!result.Attributes) {
			return null;
		}

		return this.tableToEntity(unmarshall(result.Attributes) as TableType);
	}

	protected getExclusiveStartKey(continueFrom?: string) {
		if (!continueFrom) return;

		return marshall(JSON.parse(continueFrom));
	}

	protected toCursor(p: Record<string, AttributeValue>) {
		return JSON.stringify(unmarshall(p));
	}

	// Internal Methods

	private getUpdateData(d: Record<string, any>) {
		const updateExpression = [] as Array<string>;
		const expressionAttributeNames = {} as Record<string, string>;
		const expressionAttributeValues = {} as Record<string, any>;

		const tableData = this.entityToTable(d as any);

		Object.entries(tableData as any).forEach(([key, value]) => {
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			const randomKey = uid(4);
			updateExpression.push(`#${randomKey} = :${randomKey}`);
			expressionAttributeNames[`#${randomKey}`] = key;
			expressionAttributeValues[`:${randomKey}`] = value;
		});

		return {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			UpdateExpression: `SET ${updateExpression.join(", ")}`,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			ExpressionAttributeNames: expressionAttributeNames,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			ExpressionAttributeValues: marshall(expressionAttributeValues),
		};
	}

	// Abstract Methods

	protected abstract entityToTable(i: Partial<EntityType>): Partial<TableType>;

	protected abstract tableToEntity(i: TableType): EntityType;
}
