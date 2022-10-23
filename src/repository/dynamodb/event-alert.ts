/* eslint-disable @typescript-eslint/naming-convention */

import { BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { cleanObj } from "@techmmunity/utils";

import type {
	DeleteEventsInput,
	EventAlertEntity,
	EventAlertRepository,
	GetDiscordChannelEventsInput,
	GetDiscordGuildEventsInput,
	GetEventsInput,
} from "../../models/event-alert";

import { DynamodbRepository } from ".";

import type { AlertTypeEnum } from "../../types/enums/alert-type";
import type { GenderEnum } from "../../types/enums/gender";
import { PlatformEnum } from "../../types/enums/platform";
import type { ProductTypeEnum } from "../../types/enums/product-type";

export interface EventAlertTable {
	platform: PlatformEnum;
	alertType: AlertTypeEnum;
	storeId?: string | "ALL";
	productType?: ProductTypeEnum | "ALL";
	gender?: GenderEnum | "ALL";
	createdAt: string;
	// DISCORD
	discordGuildId?: string;
	discordChannelId?: string;
	discordRolesToMention?: Array<string>;

	pk: string;
	sk: string;
	platform_discordGuildId?: string;
	discordChannelId_alertType_filters?: string;
}

export class EventAlertRepositoryDynamoDB
	extends DynamodbRepository<EventAlertTable, EventAlertEntity>
	implements EventAlertRepository
{
	protected readonly tableName = "events_alerts";

	public getEvents({ cursor, limit, ...keys }: GetEventsInput) {
		return this.getMultipleItems(this.indexMain(keys), limit, cursor);
	}

	public getDiscordGuildEvents({
		cursor,
		limit,
		...keys
	}: GetDiscordGuildEventsInput) {
		return this.getMultipleItems(this.indexDiscordGuild(keys), limit, cursor);
	}

	public getDiscordChannelEvents({
		cursor,
		limit,
		...keys
	}: GetDiscordChannelEventsInput) {
		return this.getMultipleItems(this.indexDiscordChannel(keys), limit, cursor);
	}

	public async deleteEvents(items: DeleteEventsInput) {
		const itemsTable = items.map(this.entityToTable) as Array<EventAlertTable>;

		await this.dynamodb.send(
			new BatchWriteItemCommand({
				RequestItems: {
					[this.tableName]: itemsTable.map(i => ({
						DeleteRequest: {
							Key: this.indexMain(i).Key,
						},
					})),
				},
			}),
		);
	}

	// Keys

	private indexMain({
		platform,
		alertType,
		storeId,
		productType,
		gender,
	}: Pick<
		EventAlertEntity,
		"alertType" | "gender" | "platform" | "productType" | "storeId"
	>) {
		const pk = [
			`PLATFORM#${platform}`,
			`ALERT_TYPE#${alertType}`,
			`STORE#${storeId || "ALL"}`,
			`PRODUCT_TYPE#${productType || "ALL"}`,
			// eslint-disable-next-line @typescript-eslint/no-base-to-string
			`GENDER#${gender || "ALL"}`,
		].join("#");

		return {
			KeyConditionExpression: "#pk = :pk",
			ExpressionAttributeNames: {
				"#pk": "pk",
			},
			ExpressionAttributeValues: marshall({
				":pk": pk,
			}),
			Key: marshall({
				pk,
			}),
		};
	}

	private indexDiscordGuild({
		discordGuildId,
	}: Pick<EventAlertEntity, "discordGuildId">) {
		const platform_discordGuildId = `PLATFORM#${PlatformEnum.DISCORD}#DISCORD_GUILD#${discordGuildId}`;

		return {
			Index: "PlatformDiscordGuildIdDiscordChannelIdAlertTypeFilters",
			KeyConditionExpression:
				"#platform_discordGuildId = :platform_discordGuildId",
			ExpressionAttributeNames: {
				"#platform_discordGuildId": "platform_discordGuildId",
			},
			ExpressionAttributeValues: marshall({
				":platform_discordGuildId": platform_discordGuildId,
			}),
		};
	}

	private indexDiscordChannel({
		discordGuildId,
		discordChannelId,
	}: Pick<EventAlertEntity, "discordChannelId" | "discordGuildId">) {
		const platform_discordGuildId = `PLATFORM#${PlatformEnum.DISCORD}#DISCORD_GUILD#${discordGuildId}`;

		return {
			Index: "PlatformDiscordGuildIdDiscordChannelIdAlertTypeFilters",
			KeyConditionExpression:
				"#platform_discordGuildId = :platform_discordGuildId AND begins_with(#discordChannelId_alertType_filters, :discordChannelId_alertType_filters)",
			ExpressionAttributeNames: {
				"#platform_discordGuildId": "platform_discordGuildId",
				"#discordChannelId_alertType_filters":
					"discordChannelId_alertType_filters",
			},
			ExpressionAttributeValues: marshall({
				":platform_discordGuildId": platform_discordGuildId,
				":discordChannelId_alertType_filters": `DISCORD_CHANNEL#${discordChannelId}`,
			}),
		};
	}

	// Mappers

	protected entityToTable(
		entity: Partial<EventAlertEntity>,
	): Partial<EventAlertTable> {
		const platform = entity.platform
			? `PLATFORM#${entity.platform}`
			: undefined;
		const alertType = entity.alertType
			? `ALERT_TYPE#${entity.alertType}`
			: undefined;
		const storeId = entity.storeId ? `STORE#${entity.storeId}` : undefined;
		const productType = entity.productType
			? `PRODUCT_TYPE#${entity.productType}`
			: undefined;
		const gender = entity.gender ? `GENDER#${entity.gender}` : undefined;

		const pk =
			platform && alertType && storeId && productType && gender
				? [platform, alertType, storeId, productType, gender].join("#")
				: undefined;

		const discordGuildId = entity.discordGuildId
			? `DISCORD_GUILD#${entity.discordGuildId}`
			: undefined;
		const discordChannelId = entity.discordChannelId
			? `DISCORD_CHANNEL#${entity.discordChannelId}`
			: undefined;

		const sk =
			discordGuildId && discordChannelId
				? [discordGuildId, discordChannelId].filter(Boolean).join("#")
				: undefined;

		const platform_discordGuildId =
			platform && discordGuildId
				? [platform, discordGuildId].join("#")
				: undefined;
		const discordChannelId_alertType_filters =
			discordChannelId && alertType && storeId && productType && gender
				? [discordChannelId, alertType, storeId, productType, gender].join("#")
				: undefined;

		return cleanObj({
			platform: entity.platform,
			alertType: entity.alertType,
			storeId: entity.storeId,
			productType: entity.productType,
			gender: entity.gender,
			createdAt: entity.createdAt?.toString(),
			// DISCORD
			discordGuildId,
			discordChannelId,
			discordRolesToMention: entity.discordRolesToMention,

			pk,
			sk,
			// DISCORD
			platform_discordGuildId,
			discordChannelId_alertType_filters,
		});
	}

	protected tableToEntity(table: EventAlertTable): EventAlertEntity {
		return {
			platform: table.platform,
			alertType: table.alertType,
			storeId: table.storeId,
			productType: table.productType,
			gender: table.gender,
			createdAt: new Date(table.createdAt),
			// DISCORD
			discordGuildId: table.discordGuildId?.replace("DISCORD_GUILD#", ""),
			discordChannelId: table.discordChannelId?.replace("DISCORD_CHANNEL#", ""),
			discordRolesToMention: table.discordRolesToMention,
		};
	}
}
