/**
 *
 *
 * Usecase
 *
 *
 */

import type { EventAlertEntity } from "./event-alert";
import type { ProductEntity } from "./product";
import type { SaleEntity, SalePaidMessage } from "./sale";
import type { StoreEntity } from "./store";

export interface SendNewSaleAnnouncementMessagesInput {
	items: Array<EventAlertEntity>;
	sale: SaleEntity;
	store: StoreEntity;
}

export interface SendNewStoreAnnouncementMessagesInput {
	items: Array<EventAlertEntity>;
	store: StoreEntity;
}

export interface SendNewProductAnnouncementMessagesInput {
	items: Array<EventAlertEntity>;
	product: ProductEntity;
	store: StoreEntity;
}

export interface DiscordUseCase {
	sendNewSaleAnnouncementMessages: (
		p: SendNewSaleAnnouncementMessagesInput,
	) => Promise<void>;

	sendNewStoreAnnouncementMessages: (
		p: SendNewStoreAnnouncementMessagesInput,
	) => Promise<void>;

	sendNewProductAnnouncementMessages: (
		p: SendNewProductAnnouncementMessagesInput,
	) => Promise<void>;

	sendSalePaidMessage: (p: SalePaidMessage) => Promise<void>;
}

/**
 *
 *
 * Topic Messages
 *
 *
 */

export interface DiscordNotifySellerCustomProductsSaleMessage {
	sale: SaleEntity;
	accountId: string;
	discordId: string;
}

export interface DiscordNotifySellerLiveProductsSaleMessage {
	sale: SaleEntity;
	accountId: string;
	discordId: string;
}

export interface DiscordNotifySellerSaleDeliveryConfirmedMessage {
	sale: SaleEntity;
	accountId: string;
	discordId: string;
}
