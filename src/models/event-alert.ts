import type { ProductEntity } from "./product";
import type { SaleEntity } from "./sale";
import type { StoreEntity } from "./store";

import type { AlertTypeEnum } from "../types/enums/alert-type";
import type { PlatformEnum } from "../types/enums/platform";
import type { ProductTypeEnum } from "../types/enums/product-type";

/**
 * Filters allowed:
 * NEW_STORE: --
 * NEW_PRODUCT: storeId
 * NEW_SALE: storeId, productId
 * NEW_FEEDBACK: storeId, productId
 */
interface BaseEventAlert {
	platform: PlatformEnum;
	alertType: AlertTypeEnum;
	storeId?: string;
	productType?: ProductTypeEnum;
	createdAt: Date;
}

export interface DiscordEventAlert extends BaseEventAlert {
	platform: PlatformEnum.DISCORD;
	discordGuildId: string;
	discordChannelId: string;
	discordRolesToMention: Array<string>;
}

export interface TelegramEventAlert extends BaseEventAlert {
	platform: PlatformEnum.DISCORD;
	telegramChannelId: string;
}

export interface EventAlertEntity
	extends Partial<Omit<DiscordEventAlert, "platform">>,
		Partial<Omit<TelegramEventAlert, "platform">> {
	platform: PlatformEnum;
}

/**
 *
 *
 * Repository
 *
 *
 */

export interface GetEventsInput {
	platform: PlatformEnum;
	alertType: AlertTypeEnum;
	limit: number;
	cursor?: string;
}

export interface GetEventsOutput {
	items: Array<EventAlertEntity>;
	nextPage?: string;
}

export interface EventAlertRepository {
	getEvents: (p: GetEventsInput) => Promise<GetEventsOutput>;
}

/**
 *
 *
 * Usecase
 *
 *
 */

export interface EventAlertUseCase {
	processDiscordNewStoreEvent: (p: StoreEntity) => Promise<void>;

	processDiscordNewProductEvent: (p: ProductEntity) => Promise<void>;

	processDiscordNewSaleEvent: (p: SaleEntity) => Promise<void>;
}
