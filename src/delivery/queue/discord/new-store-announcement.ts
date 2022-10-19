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
	SendNewStoreAnnouncementMessagesInput,
} from "../../../models/discord";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<
	SendNewStoreAnnouncementMessagesInput,
	DiscordUseCase
>({
	from: "QUEUE",
	queue: "NewStoreAnnouncement",
}).setService(new DiscordService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await service.sendNewStoreAnnouncementMessages(data);
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
