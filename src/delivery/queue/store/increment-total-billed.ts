/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { StoreService } from "factories/store";
import type { SaleEntity } from "models/sale";
import type { StoreUseCase } from "models/store";
import { SQSProvider } from "providers/implementations/sqs";

const sqsManager = new SQSProvider<SaleEntity, StoreUseCase>({
	from: "TOPIC",
	queue: "IncrementTotalBilled",
}).setService(new StoreService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await service.increaseTotalBilled({
			storeId: data.storeId,
			amount: data.finalPrice,
		});
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const incrementTotalBilled = sqsManager.getHandler(
	__dirname,
	__filename,
);
