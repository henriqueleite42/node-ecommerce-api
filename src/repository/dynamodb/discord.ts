/* eslint-disable @typescript-eslint/naming-convention */

import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { cleanObj } from "@techmmunity/utils";

import type {
	DiscordEntity,
	DiscordRepository,
	CreateWithDiscordIdInput,
} from "../../models/discord";

import { DynamodbRepository } from ".";

export interface DiscordTable {
	accountId: string;
	discordId: string;
	dmChannelId?: string;
	discord?: {
		accessToken: string;
		refreshToken: string;
		expiresAt: string;
	};
}

export class DiscordRepositoryDynamoDB
	extends DynamodbRepository<DiscordTable, DiscordEntity>
	implements DiscordRepository
{
	protected readonly tableName = "discords";

	public async createWithDiscordId({
		accountId,
		discordId,
	}: CreateWithDiscordIdInput) {
		const item: DiscordEntity = {
			accountId,
			discordId,
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

	// Keys

	private indexAccountId({ accountId }: Pick<DiscordEntity, "accountId">) {
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

	private indexDiscordId({ discordId }: Pick<DiscordEntity, "discordId">) {
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
		entity: Partial<DiscordEntity>,
	): Partial<DiscordTable> {
		return cleanObj({
			accountId: entity.accountId ? `ACCOUNT#${entity.accountId}` : undefined,
			discordId: entity.discordId ? `DISCORD#${entity.discordId}` : undefined,
			dmChannelId: entity.dmChannelId,
			discord: entity.discord
				? {
						...entity.discord,
						expiresAt: entity.discord.expiresAt.toISOString(),
				  }
				: undefined,
		});
	}

	protected tableToEntity(table: DiscordTable): DiscordEntity {
		return {
			accountId: table.accountId.replace("ACCOUNT#", ""),
			discordId: table.discordId?.replace("DISCORD#", ""),
			dmChannelId: table.dmChannelId,
			discord: table.discord
				? {
						...table.discord,
						expiresAt: new Date(table.discord.expiresAt),
				  }
				: undefined,
		};
	}
}
