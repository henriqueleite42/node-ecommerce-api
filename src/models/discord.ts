/**
 *
 *
 * Usecase
 *
 *
 */

import type { AccessGrantedMessage } from "./content";
import type { EventAlertEntity } from "./event-alert";
import type { ProductEntity } from "./product";
import type {
	NotifySellerSaleMessage,
	SaleDeliveredMessage,
	SaleDeliveryConfirmedMessage,
	SaleEntity,
	SalePaidMessage,
} from "./sale";
import type { StoreCreatedMessage, StoreEntity } from "./store";

export interface DiscordEntity {
	accountId: string;
	discordId: string;
	dmChannelId?: string;
	discord?: {
		accessToken: string;
		refreshToken: string;
		expiresAt: Date;
	};
}

/**
 *
 *
 * Repository
 *
 *
 */

export interface CreateOutput {
	accountId: string;
	discordId: string;
}

export interface CreateWithDiscordIdInput {
	accountId: string;
	discordId: string;
}

export interface DiscordRepository {
	createWithDiscordId: (p: CreateWithDiscordIdInput) => Promise<CreateOutput>;

	getByAccountId: (accountId: string) => Promise<DiscordEntity | null>;

	getByDiscordId: (discordId: string) => Promise<DiscordEntity | null>;
}

/**
 *
 *
 * Usecase
 *
 *
 */

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
	createWithDiscordId: (p: CreateWithDiscordIdInput) => Promise<CreateOutput>;

	sendNewSaleAnnouncementMessages: (
		p: SendNewSaleAnnouncementMessagesInput,
	) => Promise<void>;

	sendNewStoreAnnouncementMessages: (
		p: SendNewStoreAnnouncementMessagesInput,
	) => Promise<void>;

	sendNewProductAnnouncementMessages: (
		p: SendNewProductAnnouncementMessagesInput,
	) => Promise<void>;

	sendBuyerSalePaidMessage: (p: SalePaidMessage) => Promise<void>;

	sendSellerManualProductsSaleMessage: (
		p: NotifySellerSaleMessage,
	) => Promise<void>;

	sendBuyerAccessGrantedMessage: (p: AccessGrantedMessage) => Promise<void>;

	sendBuyerSaleDeliveredMessage: (p: SaleDeliveredMessage) => Promise<void>;

	sendBuyerSaleDeliveryConfirmedMessage: ({
		saleId,
		clientId,
		products,
	}: SaleDeliveryConfirmedMessage) => Promise<void>;

	sendSellerSaleDeliveryConfirmedMessage: (
		p: SaleDeliveryConfirmedMessage,
	) => Promise<void>;

	sendAdminsMessageToVerifyStore: ({
		storeId,
		name,
		avatarUrl,
		bannerUrl,
	}: StoreCreatedMessage) => Promise<void>;
}
