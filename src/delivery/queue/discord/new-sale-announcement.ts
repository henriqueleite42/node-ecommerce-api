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
	SendNewSaleAnnouncementMessagesInput,
} from "../../../models/discord";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<
	SendNewSaleAnnouncementMessagesInput,
	DiscordUseCase
>({
	from: "QUEUE",
	queue: "NewSaleAnnouncement",
}).setService(new DiscordService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await service.sendNewSaleAnnouncementMessages(data);
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const newSaleAnnouncement = sqsManager.getHandler(__dirname, __filename);
