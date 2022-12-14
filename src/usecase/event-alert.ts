/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-await-in-loop */

import { sleep } from "@techmmunity/utils";

import type { QueueManager } from "../adapters/queue-manager";
import type {
	DeleteAllFromDiscordChannelInput,
	DeleteAllFromDiscordGuildInput,
	DiscordNewProductAnnouncementMessage,
	DiscordNewSaleAnnouncementMessage,
	DiscordNewStoreAnnouncementMessage,
	EventAlertRepository,
	EventAlertUseCase,
	GetEventsInput,
} from "../models/event-alert";
import type { ProductEntity } from "../models/product";
import type { SaleEntity } from "../models/sale";
import type { StoreEntity, StoreRepository } from "../models/store";

import { AlertTypeEnum } from "../types/enums/alert-type";
import { PlatformEnum } from "../types/enums/platform";

export class EventAlertUseCaseImplementation implements EventAlertUseCase {
	public constructor(
		private readonly eventAlertRepository: EventAlertRepository,
		private readonly storeRepository: StoreRepository,
		private readonly queueManager: QueueManager,
	) {}

	public async deleteAllFromDiscordGuild({
		discordGuildId,
	}: DeleteAllFromDiscordGuildInput) {
		let cursor: string | undefined;

		do {
			const { items, nextPage } =
				await this.eventAlertRepository.getDiscordGuildEvents({
					discordGuildId,
					limit: 100,
					cursor,
				});

			if (items.length === 0) {
				break;
			}

			await this.eventAlertRepository.deleteEvents(items);

			cursor = nextPage;
		} while (cursor);
	}

	public async deleteAllFromDiscordChannel({
		discordGuildId,
		discordChannelId,
	}: DeleteAllFromDiscordChannelInput) {
		let cursor: string | undefined;

		do {
			const { items, nextPage } =
				await this.eventAlertRepository.getDiscordChannelEvents({
					discordGuildId,
					discordChannelId,
					limit: 100,
					cursor,
				});

			if (items.length === 0) {
				break;
			}

			await this.eventAlertRepository.deleteEvents(items);

			cursor = nextPage;
		} while (cursor);
	}

	// eslint-disable-next-line sonarjs/cognitive-complexity
	public async processDiscordNewSaleEvent(sale: SaleEntity) {
		let cursor;

		let delay = 0;

		const store = await this.storeRepository.getById({
			storeId: sale.storeId,
		});

		if (!store) return;

		/**
		 *
		 * Check `BaseEventAlert` to see all the filters allowed
		 *
		 */
		const queries: Array<GetEventsInput> = [
			{
				// Event alerts with no filters
				platform: PlatformEnum.DISCORD,
				alertType: AlertTypeEnum.NEW_SALE,
				storeId: "ALL",
				productType: "ALL",
				gender: "ALL",
				limit: 25,
			},
			{
				// Event alerts with filter for specific store
				platform: PlatformEnum.DISCORD,
				alertType: AlertTypeEnum.NEW_SALE,
				storeId: sale.storeId,
				productType: "ALL",
				gender: "ALL",
				limit: 25,
			},
			// Event alerts with filter for specific product types
			...sale.products.map<any>(p => ({
				platform: PlatformEnum.DISCORD,
				alertType: AlertTypeEnum.NEW_SALE,
				storeId: "ALL",
				productType: p.type,
				gender: "ALL",
				limit: 25,
			})),
			// Event alerts with filter for specific store and product types
			...sale.products.map<any>(p => ({
				platform: PlatformEnum.DISCORD,
				alertType: AlertTypeEnum.NEW_SALE,
				storeId: sale.storeId,
				productType: p.type,
				gender: "ALL",
				limit: 25,
			})),
		];

		for (const query of queries) {
			do {
				const { items, nextPage } = await this.eventAlertRepository.getEvents(
					query,
				);

				if (items.length === 0) {
					break;
				}

				await this.queueManager.sendMsg<DiscordNewSaleAnnouncementMessage>({
					to: process.env.DISCORD_NEW_SALE_ANNOUNCEMENT_QUEUE_URL!,
					message: {
						items,
						sale,
						store,
					},
					delayInSeconds: delay,
				});

				// AWS SQS delay limit of 15 min
				if (delay === 900) {
					sleep(10);
					delay = 0;
				} else {
					delay++;
				}

				cursor = nextPage;
			} while (cursor);
		}
	}

	public async processDiscordNewStoreEvent(store: StoreEntity) {
		let cursor;

		let delay = 0;

		/**
		 *
		 * Check `BaseEventAlert` to see all the filters allowed
		 *
		 */
		const queries: Array<GetEventsInput> = [
			{
				// Event alerts with no filters
				platform: PlatformEnum.DISCORD,
				alertType: AlertTypeEnum.NEW_STORE,
				storeId: "ALL",
				productType: "ALL",
				gender: "ALL",
				limit: 25,
			},
			{
				// Event alerts with filter for specific gender
				platform: PlatformEnum.DISCORD,
				alertType: AlertTypeEnum.NEW_STORE,
				storeId: "ALL",
				productType: "ALL",
				gender: store.gender,
				limit: 25,
			},
		];

		for (const query of queries) {
			do {
				const { items, nextPage } = await this.eventAlertRepository.getEvents(
					query,
				);

				if (items.length === 0) {
					break;
				}

				await this.queueManager.sendMsg<DiscordNewStoreAnnouncementMessage>({
					to: process.env.DISCORD_NEW_STORE_ANNOUNCEMENT_QUEUE_URL!,
					message: {
						items,
						store,
					},
					delayInSeconds: delay,
				});

				// AWS SQS delay limit of 15 min
				if (delay === 900) {
					sleep(10);
					delay = 0;
				} else {
					delay++;
				}

				cursor = nextPage;
			} while (cursor);
		}
	}

	// eslint-disable-next-line sonarjs/cognitive-complexity
	public async processDiscordNewProductEvent(product: ProductEntity) {
		let cursor;

		let delay = 0;

		const store = await this.storeRepository.getById({
			storeId: product.storeId,
		});

		if (!store) return;

		/**
		 *
		 * Check `BaseEventAlert` to see all the filters allowed
		 *
		 */
		const queries: Array<GetEventsInput> = [
			{
				// Event alerts with no filters
				platform: PlatformEnum.DISCORD,
				alertType: AlertTypeEnum.NEW_PRODUCT,
				storeId: "ALL",
				productType: "ALL",
				gender: "ALL",
				limit: 25,
			},
			{
				// Event alerts with filter for specific store
				platform: PlatformEnum.DISCORD,
				alertType: AlertTypeEnum.NEW_PRODUCT,
				storeId: product.storeId,
				productType: "ALL",
				gender: "ALL",
				limit: 25,
			},
			{
				// Event alerts with filter for specific product types
				platform: PlatformEnum.DISCORD,
				alertType: AlertTypeEnum.NEW_PRODUCT,
				storeId: "ALL",
				productType: product.type,
				gender: "ALL",
				limit: 25,
			},
			{
				// Event alerts with filter for specific store and product types
				platform: PlatformEnum.DISCORD,
				alertType: AlertTypeEnum.NEW_PRODUCT,
				storeId: product.storeId,
				productType: product.type,
				gender: "ALL",
				limit: 25,
			},
		];

		for (const query of queries) {
			do {
				const { items, nextPage } = await this.eventAlertRepository.getEvents(
					query,
				);

				if (items.length === 0) {
					break;
				}

				await this.queueManager.sendMsg<DiscordNewProductAnnouncementMessage>({
					to: process.env.DISCORD_NEW_PRODUCT_ANNOUNCEMENT_QUEUE_URL!,
					message: {
						items,
						product,
						store,
					},
					delayInSeconds: delay,
				});

				// AWS SQS delay limit of 15 min
				if (delay === 900) {
					sleep(10);
					delay = 0;
				} else {
					delay++;
				}

				cursor = nextPage;
			} while (cursor);
		}
	}
}
