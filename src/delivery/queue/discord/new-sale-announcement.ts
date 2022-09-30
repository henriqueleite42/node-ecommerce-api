/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { DiscordService } from "../../../factories/discord";
import type { SendNewSaleAnnouncementMessagesInput } from "../../../models/discord";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<
	SendNewSaleAnnouncementMessagesInput,
	undefined
>({
	from: "QUEUE",
	queue: "NewSaleAnnouncement",
});

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ data }) => {
		const discordService = new DiscordService().getInstance();

		await discordService.sendNewSaleAnnouncementMessages(data);
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const newSaleAnnouncement = sqsManager.getHandler(__dirname, __filename);
