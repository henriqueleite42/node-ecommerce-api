/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { DiscordService } from "../../../factories/discord";
import type { DiscordUseCase } from "../../../models/discord";
import type { NotifySellerSaleMessage } from "../../../models/sale";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<NotifySellerSaleMessage, DiscordUseCase>({
	from: "QUEUE",
	queue: "NotifySellerCustomManualProductsSale",
}).setService(new DiscordService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await Promise.allSettled(
			data.map(service.sendSellerManualProductsSaleMessage),
		);
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const notifySellerCustomManualProductsSale = sqsManager.getHandler(
	__dirname,
	__filename,
);
