/* eslint-disable @typescript-eslint/naming-convention */

import { marshall } from "@aws-sdk/util-dynamodb";
import { cleanObj } from "@techmmunity/utils";

import type {
	EventAlertEntity,
	EventAlertRepository,
	GetEventsInput,
} from "../../models/event-alert";

import { DynamodbRepository } from ".";

import type { AlertTypeEnum } from "../../types/enums/alert-type";
import type { AnnouncementPlatformEnum } from "../../types/enums/platform";
import type { ProductTypeEnum } from "../../types/enums/product-type";

export interface EventAlertTable {
	platform: AnnouncementPlatformEnum;
	alertType: AlertTypeEnum;
	storeId?: string;
	productType?: ProductTypeEnum;
	createdAt: string;
	// DISCORD
	discordGuildId?: string;
	discordChannelId?: string;
	discordRolesToMention?: Array<string>;
	// TELEGRAM
	telegramChannelId?: string;

	pk: string;
	platform_alertType: string;
	platform_discordGuildId?: string;
	discordChannelId_alertType_storeId_productType?: string;
	platform_telegramChannelId?: string;
	alertType_storeId_productType?: string;
}

export class EventAlertRepositoryDynamoDB
	extends DynamodbRepository<EventAlertTable, EventAlertEntity>
	implements EventAlertRepository
{
	protected readonly tableName = "events_alerts";

	public getEvents({ cursor, limit, ...keys }: GetEventsInput) {
		return this.getMultipleItems(
			this.indexPlatformAlertType(keys),
			limit,
			cursor,
		);
	}

	// Keys

	private indexPlatformAlertType({
		platform,
		alertType,
	}: Pick<EventAlertEntity, "alertType" | "platform">) {
		return {
			KeyConditionExpression: "#platform_alertType = :platform_alertType",
			ExpressionAttributeNames: {
				"#platform_alertType": "platform_alertType",
			},
			ExpressionAttributeValues: marshall({
				":platform_alertType": `PLATFORM#${platform}#ALERT_TYPE#${alertType}`,
			}),
			Key: marshall({
				platform_alertType: `PLATFORM#${platform}#ALERT_TYPE#${alertType}`,
			}),
		};
	}

	// Mappers

	protected entityToTable(
		entity: Partial<EventAlertEntity>,
	): Partial<EventAlertTable> {
		const storeId = entity.storeId ? `STORE#${entity.storeId}` : undefined;
		const discordGuildId = entity.discordGuildId
			? `DISCORD_GUILD#${entity.discordGuildId}`
			: undefined;
		const discordChannelId = entity.discordChannelId
			? `DISCORD_CHANNEL#${entity.discordChannelId}`
			: undefined;
		const telegramChannelId = entity.telegramChannelId
			? `TELEGRAM_CHANNEL#${entity.telegramChannelId}`
			: undefined;

		const pk = [entity.platform, entity.alertType] as Array<string>;

		if (entity.storeId) {
			pk.push(entity.storeId);
		}

		if (entity.productType) {
			pk.push(entity.productType);
		}

		if (discordGuildId) {
			pk.push(discordGuildId);
		}

		if (discordChannelId) {
			pk.push(discordChannelId);
		}

		if (telegramChannelId) {
			pk.push(telegramChannelId);
		}

		return cleanObj({
			platform: entity.platform,
			alertType: entity.alertType,
			storeId,
			productType: entity.productType,
			createdAt: entity.createdAt?.toString(),
			// DISCORD
			discordGuildId,
			discordChannelId,
			discordRolesToMention: entity.discordRolesToMention,
			// TELEGRAM
			telegramChannelId,

			pk: pk.join("#"),
			platform_alertType: `${entity.platform}#${entity.alertType}`,
			platform_discordGuildId: discordGuildId
				? `${entity.platform}#${discordGuildId}`
				: undefined,
			discordChannelId_alertType_storeId_productType:
				discordChannelId && storeId && entity.productType
					? `${discordChannelId}#${entity.alertType}#${storeId}#${entity.productType}`
					: undefined,
			platform_telegramChannelId: telegramChannelId
				? `${entity.platform}#${telegramChannelId}`
				: undefined,
			alertType_storeId_productType:
				storeId && entity.productType
					? `${entity.alertType}#${storeId}#${entity.productType}`
					: undefined,
		});
	}

	protected tableToEntity(table: EventAlertTable): EventAlertEntity {
		return {
			platform: table.platform,
			alertType: table.alertType,
			storeId: table.storeId?.replace("STORE#", ""),
			productType: table.productType,
			createdAt: new Date(table.createdAt),
			// DISCORD
			discordGuildId: table.discordGuildId?.replace("DISCORD_GUILD#", ""),
			discordChannelId: table.discordChannelId?.replace("DISCORD_CHANNEL#", ""),
			discordRolesToMention: table.discordRolesToMention,
			// TELEGRAM
			telegramChannelId: table.telegramChannelId?.replace(
				"TELEGRAM_CHANNEL#",
				"",
			),
		};
	}
}
