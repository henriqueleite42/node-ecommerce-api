/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { DiscordService } from "../../../factories/discord";
import type { DiscordUseCase } from "../../../models/discord";
import type { SalePaidMessage } from "../../../models/sale";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<SalePaidMessage, DiscordUseCase>({
	from: "TOPIC",
	queue: "NotifyBuyerSalePaid",
}).setService(new DiscordService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await service.sendBuyerSalePaidMessage(data);
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const notifyBuyerSalePaid = sqsManager.getHandler(__dirname, __filename);
