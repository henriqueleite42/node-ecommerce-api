/* eslint-disable @typescript-eslint/naming-convention */

import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { cleanObj } from "@techmmunity/utils";
import type {
	BalanceEntity,
	BalanceRepository,
	GetByIdInput,
	IncrementBalanceInput,
	WithdrawalInput,
} from "models/balance";

import { DynamodbRepository } from ".";

export interface BalanceTable {
	accountId: string;
	balance: number;
	withdrawalMethods: BalanceEntity["withdrawalMethods"];
}

export class BalanceRepositoryDynamoDB
	extends DynamodbRepository<BalanceTable, BalanceEntity>
	implements BalanceRepository
{
	protected readonly tableName = "balances";

	public async incrementBalance({ accountId, amount }: IncrementBalanceInput) {
		await this.dynamodb.send(
			new UpdateItemCommand({
				TableName: this.tableName,
				UpdateExpression: "SET #balance = #balance + :amount",
				ExpressionAttributeNames: {
					"#balance": "balance",
				},
				ExpressionAttributeValues: marshall({
					":amount": amount,
				}),
				Key: this.indexAccountId({ accountId }).Key,
			}),
		);
	}

	public async withdrawal({ accountId, amount }: WithdrawalInput) {
		await this.dynamodb.send(
			new UpdateItemCommand({
				TableName: this.tableName,
				UpdateExpression: "SET #balance = #balance - :amount",
				ExpressionAttributeNames: {
					"#balance": "balance",
				},
				ExpressionAttributeValues: marshall({
					":amount": amount,
				}),
				ReturnValues: "ALL_NEW",
				Key: this.indexAccountId({ accountId }).Key,
			}),
		);
	}

	public getById({ accountId }: GetByIdInput) {
		return this.getSingleItem(this.indexAccountId({ accountId }));
	}

	// Keys

	private indexAccountId(entity: Pick<BalanceEntity, "accountId">) {
		return {
			ExpressionAttributeNames: {
				"#accountId": "accountId",
			},
			ExpressionAttributeValues: marshall({
				":accountId": `ACCOUNT#${entity.accountId}`,
			}),
			Key: marshall({
				accountId: `ACCOUNT#${entity.accountId}`,
			}),
		};
	}

	// Mappers

	protected entityToTable(entity: BalanceEntity): BalanceTable {
		return cleanObj({
			accountId: `ACCOUNT#${entity.accountId}`,
			balance: entity.balance,
			withdrawalMethods: entity.withdrawalMethods,
		});
	}

	protected tableToEntity(table: BalanceTable): BalanceEntity {
		return {
			accountId: table.accountId.replace("ACCOUNT#", ""),
			balance: table.balance,
			withdrawalMethods: table.withdrawalMethods,
		};
	}
}
