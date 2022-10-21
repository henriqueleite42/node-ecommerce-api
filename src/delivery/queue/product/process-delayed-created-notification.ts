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
		await Promise.allSettled(
			data.map(service.processDelayedCreatedNotification),
		);
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
