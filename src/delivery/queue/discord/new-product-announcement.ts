/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { DiscordService } from "../../../factories/discord";
import type {
	DiscordUseCase,
	SendNewProductAnnouncementMessagesInput,
} from "../../../models/discord";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<
	SendNewProductAnnouncementMessagesInput,
	DiscordUseCase
>({
	from: "QUEUE",
	queue: "NewProductAnnouncement",
}).setService(new DiscordService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await service.sendNewProductAnnouncementMessages(data);
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const newProductAnnouncement = sqsManager.getHandler(
	__dirname,
	__filename,
);
