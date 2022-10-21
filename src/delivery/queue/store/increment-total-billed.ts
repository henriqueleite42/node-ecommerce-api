/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { StoreService } from "../../../factories/store";
import type { SalePaidMessage } from "../../../models/sale";
import type { StoreUseCase } from "../../../models/store";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<SalePaidMessage, StoreUseCase>({
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
		await Promise.allSettled(
			data.map(d =>
				service.increaseTotalBilled({
					storeId: d.storeId,
					amount: d.finalValue,
				}),
			),
		);
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
