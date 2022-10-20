/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { ProductService } from "../../../factories/product";
import type {
	DelayProductCreatedNotificationMessage,
	ProductUseCase,
} from "../../../models/product";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<
	DelayProductCreatedNotificationMessage,
	ProductUseCase
>({
	from: "QUEUE",
	queue: "DelayProductCreatedNotification",
}).setService(new ProductService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await service.processDelayedCreatedNotification(data);
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const processDelayedCreatedNotification = sqsManager.getHandler(
	__dirname,
	__filename,
);
