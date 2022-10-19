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
	queue: "NotifySellerCustomProductsSale",
}).setService(new DiscordService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await service.sendSellerOrderLiveCustomProductCreatedMessage(data);
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const notifySellerCustomProductsSale = sqsManager.getHandler(
	__dirname,
	__filename,
);
