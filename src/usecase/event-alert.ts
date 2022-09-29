/* eslint-disable no-await-in-loop */

import type { QueueManager } from "../adapters/queue-manager";
import type {
	EventAlertRepository,
	EventAlertUseCase,
} from "../models/event-alert";
import type { ProductEntity } from "../models/product";
import type { SaleEntity } from "../models/sale";
import type { StoreEntity } from "../models/store";

import { AlertTypeEnum } from "../types/enums/alert-type";
import { AnnouncementPlatformEnum } from "../types/enums/platform";

export class EventAlertUseCaseImplementation implements EventAlertUseCase {
	public constructor(
		private readonly eventAlertRepository: EventAlertRepository,
		private readonly queueManager: QueueManager,
	) {}

	public async processDiscordNewStoreEvent(sale: StoreEntity) {
		let cursor;

		let delay = 0;

		do {
			const { items, nextPage } = await this.eventAlertRepository.getEvents({
				platform: AnnouncementPlatformEnum.DISCORD,
				alertType: AlertTypeEnum.NEW_STORE,
				limit: 25,
			});

			this.queueManager.sendMsg({
				to: "",
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

	public async processDiscordNewProductEvent(product: ProductEntity) {
		let cursor;

		let delay = 0;

		do {
			const { items, nextPage } = await this.eventAlertRepository.getEvents({
				platform: AnnouncementPlatformEnum.DISCORD,
				alertType: AlertTypeEnum.NEW_STORE,
				limit: 25,
			});

			const alerts = items.filter(i => {
				if (!i.storeId && !i.productType) return true;

				if (i.storeId && i.storeId !== product.storeId) return false;

				if (i.productType && i.productType !== product.type) return false;

				return true;
			});

			if (alerts.length > 0) {
				this.queueManager.sendMsg({
					to: "",
					message: {
						items: alerts,
						product,
					},
					delayInSeconds: delay,
				});

				delay++;
			}

			cursor = nextPage;
		} while (cursor);
	}

	public async processDiscordNewSaleEvent(sale: SaleEntity) {
		let cursor;

		let delay = 0;

		do {
			const { items, nextPage } = await this.eventAlertRepository.getEvents({
				platform: AnnouncementPlatformEnum.DISCORD,
				alertType: AlertTypeEnum.NEW_STORE,
				limit: 25,
			});

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
					to: "",
					message: {
						items: alerts,
						sale,
					},
					delayInSeconds: delay,
				});

				delay++;
			}

			cursor = nextPage;
		} while (cursor);
	}
}
