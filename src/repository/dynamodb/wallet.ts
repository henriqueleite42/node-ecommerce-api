/* eslint-disable @typescript-eslint/naming-convention */

import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { cleanObj } from "@techmmunity/utils";
import type {
	WalletEntity,
	WalletRepository,
	GetByIdInput,
	IncrementBalanceInput,
	WithdrawalInput,
} from "models/wallet";

import { DynamodbRepository } from ".";

export interface WalletTable {
	accountId: string;
	balance: number;
	withdrawalMethods: WalletEntity["withdrawalMethods"];
}

export class WalletRepositoryDynamoDB
	extends DynamodbRepository<WalletTable, WalletEntity>
	implements WalletRepository
{
	protected readonly tableName = "wallets";

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

	private indexAccountId(entity: Pick<WalletEntity, "accountId">) {
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

	protected entityToTable(entity: WalletEntity): WalletTable {
		return cleanObj({
			accountId: `ACCOUNT#${entity.accountId}`,
			balance: entity.balance,
			withdrawalMethods: entity.withdrawalMethods,
		});
	}

	protected tableToEntity(table: WalletTable): WalletEntity {
		return {
			accountId: table.accountId.replace("ACCOUNT#", ""),
			balance: table.balance,
			withdrawalMethods: table.withdrawalMethods,
		};
	}
}
