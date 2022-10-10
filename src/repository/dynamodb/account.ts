/* eslint-disable @typescript-eslint/naming-convention */

import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { cleanObj } from "@techmmunity/utils";

import type { AccountRepository, AccountEntity } from "../../models/account";

import { DynamodbRepository } from ".";

import { genId } from "../../utils/id/gen-id";

export interface AccountTable {
	accountId: string;
	discordId: string;
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
			accountId: await genId(),
			discordId,
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
		const index = this.indexDiscordId({ discordId });

		return this.getSingleItem(index);
	}

	// Keys

	private indexAccountId({ accountId }: Pick<AccountEntity, "accountId">) {
		return {
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

	protected entityToTable(
		entity: Partial<AccountEntity>,
	): Partial<AccountTable> {
		return cleanObj({
			accountId: entity.accountId ? `ACCOUNT#${entity.accountId}` : undefined,
			discordId: entity.discordId ? `DISCORD#${entity.discordId}` : undefined,
			createdAt: entity.createdAt?.toISOString(),
		});
	}

	protected tableToEntity(table: AccountTable): AccountEntity {
		return {
			accountId: table.accountId.replace("ACCOUNT#", ""),
			discordId: table.discordId.replace("DISCORD#", ""),
			createdAt: new Date(table.createdAt),
		};
	}
}
