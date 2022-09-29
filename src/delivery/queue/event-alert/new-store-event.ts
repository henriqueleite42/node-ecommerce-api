/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { EventAlertService } from "../../../factories/event-alert";
import type { EventAlertUseCase } from "../../../models/event-alert";
import type { StoreEntity } from "../../../models/store";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<StoreEntity, EventAlertUseCase>({
	from: "TOPIC",
	queue: "DiscordNewStoreEvent",
}).setService(new EventAlertService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await service.processDiscordNewStoreEvent(data);
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const newStoreEvent = sqsManager.getHandler(__dirname, __filename);
