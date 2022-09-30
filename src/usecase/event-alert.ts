/* eslint-disable no-await-in-loop */

import type { QueueManager } from "../adapters/queue-manager";
import type {
	EventAlertRepository,
	EventAlertUseCase,
} from "../models/event-alert";
import type { ProductEntity } from "../models/product";
import type { SaleEntity } from "../models/sale";
import type { StoreEntity, StoreRepository } from "../models/store";

import { AlertTypeEnum } from "../types/enums/alert-type";
import { AnnouncementPlatformEnum } from "../types/enums/platform";

export class EventAlertUseCaseImplementation implements EventAlertUseCase {
	public constructor(
		private readonly eventAlertRepository: EventAlertRepository,
		private readonly storeRepository: StoreRepository,
		private readonly queueManager: QueueManager,
	) {}

	// eslint-disable-next-line sonarjs/cognitive-complexity
	public async processDiscordNewSaleEvent(sale: SaleEntity) {
		let cursor;

		let delay = 0;

		const store = await this.storeRepository.getById({
			storeId: sale.storeId,
		});

		do {
			const { items, nextPage } = await this.eventAlertRepository.getEvents({
				platform: AnnouncementPlatformEnum.DISCORD,
				alertType: AlertTypeEnum.NEW_STORE,
				limit: 25,
			});

			if (items.length === 0) {
				return;
			}

			const alerts = items.filter(i => {
				if (!i.storeId && !i.productType) return true;

				if (i.storeId && i.storeId !== sale.storeId) return false;

				if (
					i.productType &&
					!sale.products.some(p => p.type === i.productType)
				) {
					return false;
				}

				return true;
			});

			if (alerts.length > 0) {
				this.queueManager.sendMsg({
					to: process.env.DISCORD_NEW_SALE_ANNOUNCEMENT_QUEUE_URL!,
					message: {
						items: alerts,
						sale,
						store,
					},
					delayInSeconds: delay,
				});

				delay++;
			}

			cursor = nextPage;
		} while (cursor);
	}

	public async processDiscordNewStoreEvent(sale: StoreEntity) {
		let cursor;

		let delay = 0;

		do {
			const { items, nextPage } = await this.eventAlertRepository.getEvents({
				platform: AnnouncementPlatformEnum.DISCORD,
				alertType: AlertTypeEnum.NEW_STORE,
				limit: 25,
			});

			if (items.length === 0) {
				return;
			}

			this.queueManager.sendMsg({
				to: process.env.DISCORD_NEW_STORE_ANNOUNCEMENT_QUEUE_URL!,
				message: {
					items,
					sale,
				},
				delayInSeconds: delay,
			});

			cursor = nextPage;
			delay++;
		} while (cursor);
	}

	// eslint-disable-next-line sonarjs/cognitive-complexity
	public async processDiscordNewProductEvent(product: ProductEntity) {
		let cursor;

		let delay = 0;

		const store = await this.storeRepository.getById({
			storeId: product.storeId,
		});

		do {
			const { items, nextPage } = await this.eventAlertRepository.getEvents({
				platform: AnnouncementPlatformEnum.DISCORD,
				alertType: AlertTypeEnum.NEW_STORE,
				limit: 25,
			});

			if (items.length === 0) {
				return;
			}

			const alerts = items.filter(i => {
				if (!i.storeId && !i.productType) return true;

				if (i.storeId && i.storeId !== product.storeId) return false;

				if (i.productType && i.productType !== product.type) return false;

				return true;
			});

			if (alerts.length > 0) {
				this.queueManager.sendMsg({
					to: process.env.DISCORD_NEW_PRODUCT_ANNOUNCEMENT_QUEUE_URL!,
					message: {
						items: alerts,
						product,
						store,
					},
					delayInSeconds: delay,
				});

				delay++;
			}

			cursor = nextPage;
		} while (cursor);
	}
}
