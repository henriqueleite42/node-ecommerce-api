/* eslint-disable @typescript-eslint/naming-convention */

import { PutItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { cleanObj } from "@techmmunity/utils";

import type {
	WalletEntity,
	WalletRepository,
	GetByIdInput,
	IncrementPendingBalanceInput,
	WithdrawalInput,
	CreateInput,
	AddWWMInput,
	ReleasePendingBalanceInput,
} from "../../models/wallet";

import { DynamodbRepository } from ".";

export interface WalletTable {
	accountId: string;
	balance: number;
	pendingBalance: number;
	withdrawalMethods: WalletEntity["withdrawalMethods"];
}

export class WalletRepositoryDynamoDB
	extends DynamodbRepository<WalletTable, WalletEntity>
	implements WalletRepository
{
	protected readonly tableName = "wallets";

	public async create({ accountId }: CreateInput) {
		const item: WalletEntity = {
			accountId,
			balance: 0,
			pendingBalance: 0,
			withdrawalMethods: [],
		};

		await this.dynamodb.send(
			new PutItemCommand({
				TableName: this.tableName,
				Item: marshall(this.entityToTable(item)),
			}),
		);

		return item;
	}

	public async incrementPendingBalance({
		accountId,
		amount,
	}: IncrementPendingBalanceInput) {
		await this.dynamodb.send(
			new UpdateItemCommand({
				TableName: this.tableName,
				UpdateExpression: "SET #pendingBalance = #pendingBalance + :amount",
				ExpressionAttributeNames: {
					"#pendingBalance": "pendingBalance",
				},
				ExpressionAttributeValues: marshall({
					":amount": amount,
				}),
				Key: this.indexAccountId({ accountId }).Key,
			}),
		);
	}

	public async releasePendingBalance({
		accountId,
		amount,
	}: ReleasePendingBalanceInput) {
		await this.dynamodb.send(
			new UpdateItemCommand({
				TableName: this.tableName,
				UpdateExpression:
					"SET #pendingBalance = #pendingBalance - :amount, #balance = #balance + :amount",
				ConditionExpression: "#pendingBalance >= :amount",
				ExpressionAttributeNames: {
					"#pendingBalance": "pendingBalance",
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

	public async addWWM({ accountId, ...data }: AddWWMInput) {
		const result = await this.dynamodb.send(
			new UpdateItemCommand({
				TableName: this.tableName,
				ReturnValues: "ALL_NEW",
				Key: this.indexAccountId({ accountId }).Key,
				UpdateExpression:
					"SET #withdrawalMethods = list_append(#withdrawalMethods, :WWM)",
				ExpressionAttributeNames: {
					"#withdrawalMethods": "withdrawalMethods",
				},
				ExpressionAttributeValues: marshall({
					":WWM": data,
				}),
			}),
		);

		if (!result.Attributes) {
			return null;
		}

		return this.tableToEntity(unmarshall(result.Attributes) as WalletTable);
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

	protected entityToTable(entity: Partial<WalletEntity>): Partial<WalletTable> {
		return cleanObj({
			accountId: entity.accountId ? `ACCOUNT#${entity.accountId}` : undefined,
			balance: entity.balance,
			pendingBalance: entity.pendingBalance,
			withdrawalMethods: entity.withdrawalMethods,
		});
	}

	protected tableToEntity(table: WalletTable): WalletEntity {
		return {
			accountId: table.accountId.replace("ACCOUNT#", ""),
			balance: table.balance,
			pendingBalance: table.pendingBalance,
			withdrawalMethods: table.withdrawalMethods,
		};
	}
}
