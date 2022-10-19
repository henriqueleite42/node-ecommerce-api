/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { DiscordService } from "../../../factories/discord";
import type { AccessGrantedMessage } from "../../../models/content";
import type { DiscordUseCase } from "../../../models/discord";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<AccessGrantedMessage, DiscordUseCase>({
	from: "TOPIC",
	queue: "NotifyBuyerAccessGranted",
}).setService(new DiscordService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await service.sendBuyerAccessGrantedMessage(data);
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const notifyBuyerAccessGrantedMessage = sqsManager.getHandler(
	__dirname,
	__filename,
);
