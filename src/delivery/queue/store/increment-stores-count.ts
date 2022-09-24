/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { StoreService } from "factories/store";
import type { StoreUseCase } from "models/store";
import { SQSProvider } from "providers/implementations/sqs";

const sqsManager = new SQSProvider<undefined, StoreUseCase>({
	from: "TOPIC",
	queue: "IncrementStoresCount",
}).setService(new StoreService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service }) => {
		await service.increaseStoresCount();
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const incrementStoresCount = sqsManager.getHandler(
	__dirname,
	__filename,
);
