/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { DiscordService } from "../../../factories/discord";
import type { SendNewStoreAnnouncementMessagesInput } from "../../../models/discord";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<
	SendNewStoreAnnouncementMessagesInput,
	undefined
>({
	from: "QUEUE",
	queue: "NewStoreAnnouncement",
});

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ data }) => {
		const discordService = new DiscordService().getInstance();

		await discordService.sendNewStoreAnnouncementMessages(data);
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const newStoreAnnouncement = sqsManager.getHandler(
	__dirname,
	__filename,
);
