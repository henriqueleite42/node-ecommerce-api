/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { DiscordService } from "../../../factories/discord";
import type { SendNewProductAnnouncementMessagesInput } from "../../../models/discord";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<
	SendNewProductAnnouncementMessagesInput,
	undefined
>({
	from: "QUEUE",
	queue: "NewProductAnnouncement",
});

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ data }) => {
		const discordService = new DiscordService().getInstance();

		await discordService.sendNewProductAnnouncementMessages(data);
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
