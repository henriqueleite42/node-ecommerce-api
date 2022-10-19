/* eslint-disable @typescript-eslint/naming-convention */

import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { cleanObj } from "@techmmunity/utils";

import type {
	AccountRepository,
	AccountEntity,
	CreateWithDiscordIdInput,
	CreateWithDiscordInput,
} from "../../models/account";

import { DynamodbRepository } from ".";

import { genId } from "../../utils/id/gen-id";

import { PlatformEnum } from "../../types/enums/platform";

export interface AccountTable {
	accountId: string;
	admin: boolean;
	notifyThrough: PlatformEnum;
	discordId?: string;
	discord?: {
		accessToken: string;
		refreshToken: string;
		expiresAt: string;
	};
	createdAt: string;
}

export class AccountRepositoryDynamoDB
	extends DynamodbRepository<AccountTable, AccountEntity>
	implements AccountRepository
{
	protected readonly tableName = "accounts";

	public async createWithDiscord({
		discordId,
		discord,
	}: CreateWithDiscordInput) {
		const item: AccountEntity = {
			accountId: await genId(),
			admin: false,
			discordId,
			discord,
			notifyThrough: PlatformEnum.DISCORD,
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

	public async createWithDiscordId({ discordId }: CreateWithDiscordIdInput) {
		const item: AccountEntity = {
			accountId: await genId(),
			discordId,
			admin: false,
			notifyThrough: PlatformEnum.DISCORD,
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
			admin: entity.admin,
			notifyThrough: entity.notifyThrough,
			discordId: entity.discordId ? `DISCORD#${entity.discordId}` : undefined,
			discord: entity.discord
				? {
						...entity.discord,
						expiresAt: entity.discord.expiresAt.toISOString(),
				  }
				: undefined,
			createdAt: entity.createdAt?.toISOString(),
		});
	}

	protected tableToEntity(table: AccountTable): AccountEntity {
		return {
			accountId: table.accountId.replace("ACCOUNT#", ""),
			admin: table.admin,
			notifyThrough: table.notifyThrough,
			discordId: table.discordId?.replace("DISCORD#", ""),
			discord: table.discord
				? {
						...table.discord,
						expiresAt: new Date(table.discord.expiresAt),
				  }
				: undefined,
			createdAt: new Date(table.createdAt),
		};
	}
}
