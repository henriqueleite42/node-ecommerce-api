/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { DiscordService } from "../../../factories/discord";
import type { DiscordUseCase } from "../../../models/discord";
import type { StoreCreatedMessage } from "../../../models/store";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<StoreCreatedMessage, DiscordUseCase>({
	from: "QUEUE",
	queue: "NotifyAdminsToVerifyStore",
}).setService(new DiscordService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await Promise.allSettled(data.map(service.sendAdminsMessageToVerifyStore));
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const notifyAdminsToVerifyStore = sqsManager.getHandler(
	__dirname,
	__filename,
);
