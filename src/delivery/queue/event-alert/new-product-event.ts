/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { EventAlertService } from "../../../factories/event-alert";
import type { EventAlertUseCase } from "../../../models/event-alert";
import type { ProductEntity } from "../../../models/product";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<ProductEntity, EventAlertUseCase>({
	from: "TOPIC",
	queue: "DiscordNewProductEvent",
}).setService(new EventAlertService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await Promise.allSettled(data.map(service.processDiscordNewProductEvent));
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const newProductEvent = sqsManager.getHandler(__dirname, __filename);
