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
import type { PlatformEnum } from "../../types/enums/platform";
import type { ProductTypeEnum } from "../../types/enums/product-type";

export interface EventAlertTable {
	platform: PlatformEnum;
	alertType: AlertTypeEnum;
	storeId?: string | "ALL";
	productType?: ProductTypeEnum | "ALL";
	createdAt: string;
	// DISCORD
	discordGuildId?: string;
	discordChannelId?: string;
	discordRolesToMention?: Array<string>;

	pk: string;
	sk: string;
	platform_discordGuildId?: string;
	discordChannelId_alertType_storeId_productType?: string;
}

export class EventAlertRepositoryDynamoDB
	extends DynamodbRepository<EventAlertTable, EventAlertEntity>
	implements EventAlertRepository
{
	protected readonly tableName = "events_alerts";

	public getEvents({ cursor, limit, ...keys }: GetEventsInput) {
		return this.getMultipleItems(this.indexMain(keys), limit, cursor);
	}

	// Keys

	private indexMain({
		platform,
		alertType,
		storeId,
		productType,
	}: Pick<
		EventAlertEntity,
		"alertType" | "platform" | "productType" | "storeId"
	>) {
		const value = `PLATFORM#${platform}#ALERT_TYPE#${alertType}#STORE#${
			storeId || "ALL"
		}#PRODUCT_TYPE#${productType || "ALL"}`;

		return {
			KeyConditionExpression:
				"#platform_alertType_storeId_productType = :platform_alertType_storeId_productType",
			ExpressionAttributeNames: {
				"#platform_alertType_storeId_productType":
					"platform_alertType_storeId_productType",
			},
			ExpressionAttributeValues: marshall({
				":platform_alertType_storeId_productType": value,
			}),
			Key: marshall({
				platform_alertType_storeId_productType: value,
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
		const productType = entity.storeId
			? `PRODUCT_TYPE#${entity.productType}`
			: undefined;

		const pk =
			platform && alertType && storeId && productType
				? [platform, alertType, storeId, productType].join("#")
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
		const discordChannelId_alertType_storeId_productType =
			discordChannelId && alertType && storeId && productType
				? [discordChannelId, alertType, storeId, productType].join("#")
				: undefined;

		return cleanObj({
			platform: entity.platform,
			alertType: entity.alertType,
			storeId: entity.storeId,
			productType: entity.productType,
			createdAt: entity.createdAt?.toString(),
			// DISCORD
			discordGuildId,
			discordChannelId,
			discordRolesToMention: entity.discordRolesToMention,

			pk,
			sk,
			// DISCORD
			platform_discordGuildId,
			discordChannelId_alertType_storeId_productType,
		});
	}

	protected tableToEntity(table: EventAlertTable): EventAlertEntity {
		return {
			platform: table.platform,
			alertType: table.alertType,
			storeId: table.storeId,
			productType: table.productType,
			createdAt: new Date(table.createdAt),
			// DISCORD
			discordGuildId: table.discordGuildId?.replace("DISCORD_GUILD#", ""),
			discordChannelId: table.discordChannelId?.replace("DISCORD_CHANNEL#", ""),
			discordRolesToMention: table.discordRolesToMention,
		};
	}
}
