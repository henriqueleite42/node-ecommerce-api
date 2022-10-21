/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { DiscordService } from "../../../factories/discord";
import type {
	DiscordNotifySellerLiveProductsSaleMessage,
	DiscordUseCase,
} from "../../../models/discord";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<
	DiscordNotifySellerLiveProductsSaleMessage,
	DiscordUseCase
>({
	from: "QUEUE",
	queue: "NotifySellerLiveProductsSale",
}).setService(new DiscordService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await Promise.allSettled(
			data.map(service.sendSellerOrderLiveCustomProductCreatedMessage),
		);
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const notifySellerLiveProductsSale = sqsManager.getHandler(
	__dirname,
	__filename,
);
