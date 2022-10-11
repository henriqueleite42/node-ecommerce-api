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
	storeId?: string;
	productType?: ProductTypeEnum;
	createdAt: string;
	// DISCORD
	discordGuildId?: string;
	discordChannelId?: string;
	discordRolesToMention?: Array<string>;

	platform_alertType_storeId_productType: string;
	channelsIds: string;
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
	}: Partial<Pick<EventAlertEntity, "productType" | "storeId">> &
		Pick<EventAlertEntity, "alertType" | "platform">) {
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
		const platform = `PLATFORM#${entity.platform}`;
		const alertType = `ALERT_TYPE#${entity.alertType}`;
		const storeId = `STORE#${entity.storeId || "ALL"}`;
		const productType = `PRODUCT_TYPE#${entity.productType || "ALL"}`;

		const platform_alertType_storeId_productType = [
			platform,
			alertType,
			storeId,
			productType,
		].join("#");

		const discordGuildId = entity.discordGuildId
			? `DISCORD_GUILD#${entity.discordGuildId}`
			: undefined;
		const discordChannelId = entity.discordChannelId
			? `DISCORD_CHANNEL#${entity.discordChannelId}`
			: undefined;

		const channelsIds = [discordGuildId, discordChannelId]
			.filter(Boolean)
			.join("#");

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

			platform_alertType_storeId_productType,
			channelsIds,
			// DISCORD
			platform_discordGuildId: discordGuildId
				? [platform, discordGuildId].join("#")
				: undefined,
			discordChannelId_alertType_storeId_productType: discordChannelId
				? [discordChannelId, alertType, storeId, productType].join("#")
				: undefined,
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
