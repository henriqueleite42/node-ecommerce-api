/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { EventAlertService } from "../../../factories/event-alert";
import type { EventAlertUseCase } from "../../../models/event-alert";
import type { SaleEntity } from "../../../models/sale";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<SaleEntity, EventAlertUseCase>({
	from: "TOPIC",
	queue: "DiscordNewSaleEvent",
}).setService(new EventAlertService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await Promise.allSettled(data.map(service.processDiscordNewSaleEvent));
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const newSaleEvent = sqsManager.getHandler(__dirname, __filename);
