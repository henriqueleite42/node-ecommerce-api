/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { DiscordService } from "../../../factories/discord";
import type { DiscordUseCase } from "../../../models/discord";
import type { SaleDeliveryConfirmedMessage } from "../../../models/sale";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<
	SaleDeliveryConfirmedMessage,
	DiscordUseCase
>({
	from: "QUEUE",
	queue: "NotifySellerSaleDeliveryConfirmed",
}).setService(new DiscordService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await service.sendSellerSaleDeliveryConfirmedMessage(data);
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const notifySellerSaleDeliveryConfirmed = sqsManager.getHandler(
	__dirname,
	__filename,
);
