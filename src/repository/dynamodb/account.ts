/* eslint-disable @typescript-eslint/naming-convention */

import { PutItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { v4 } from "uuid";

import type {
	AccountRepository,
	AccountEntity,
	IncrementBalanceInput,
} from "../../models/account";

import { DynamodbRepository } from ".";

export interface AccountTable {
	accountId: string;
	discordId: string;
	balance: number;
	createdAt: string;
}

export class AccountRepositoryDynamoDB
	extends DynamodbRepository<AccountTable, AccountEntity>
	implements AccountRepository
{
	protected readonly tableName = "accounts";

	public async createWithDiscordId({
		discordId,
	}: Pick<AccountEntity, "discordId">) {
		const item: AccountEntity = {
			accountId: v4(),
			discordId,
			balance: 0,
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

	public getByAccountId(accountId: string) {
		return this.getSingleItem(this.indexAccountId({ accountId }));
	}

	public getByDiscordId(discordId: string) {
		return this.getSingleItem(this.indexDiscordId({ discordId }));
	}

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

	// Keys

	private indexAccountId({ accountId }: Pick<AccountEntity, "accountId">) {
		return {
			IndexName: "AccountId",
			KeyConditionExpression: "#accountId = :accountId",
			ExpressionAttributeNames: {
				"#accountId": "accountId",
			},
			ExpressionAttributeValues: marshall({
				":accountId": `ACCOUNT#${accountId}`,
			}),
			Key: marshall({
				accountId: `ACCOUNT#${accountId}`,
			}),
		};
	}

	private indexDiscordId({ discordId }: Pick<AccountEntity, "discordId">) {
		return {
			IndexName: "DiscordId",
			KeyConditionExpression: "#discordId = :discordId",
			ExpressionAttributeNames: {
				"#discordId": "discordId",
			},
			ExpressionAttributeValues: marshall({
				":discordId": `DISCORD#${discordId}`,
			}),
			Key: marshall({
				discordId: `DISCORD#${discordId}`,
			}),
		};
	}

	// Mappers

	protected entityToTable(entity: AccountEntity): AccountTable {
		return {
			accountId: `ACCOUNT#${entity.accountId}`,
			discordId: `DISCORD#${entity.discordId}`,
			balance: entity.balance,
			createdAt: entity.createdAt.toISOString(),
		};
	}

	protected tableToEntity(table: AccountTable): AccountEntity {
		return {
			accountId: table.accountId.replace("ACCOUNT#", ""),
			discordId: table.discordId.replace("DISCORD#", ""),
			balance: table.balance,
			createdAt: new Date(table.createdAt),
		};
	}
}
