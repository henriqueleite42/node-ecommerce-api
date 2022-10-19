/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { DiscordService } from "../../../factories/discord";
import type { DiscordUseCase } from "../../../models/discord";
import type { SaleDeliveredMessage } from "../../../models/sale";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<SaleDeliveredMessage, DiscordUseCase>({
	from: "TOPIC",
	queue: "NotifyBuyerSaleDelivered",
}).setService(new DiscordService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await service.sendBuyerSaleDeliveredMessage(data);
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const notifyBuyerSaleDelivered = sqsManager.getHandler(
	__dirname,
	__filename,
);
