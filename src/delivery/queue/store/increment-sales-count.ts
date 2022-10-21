/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { StoreService } from "../../../factories/store";
import type { SaleEntity } from "../../../models/sale";
import type { StoreUseCase } from "../../../models/store";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<SaleEntity, StoreUseCase>({
	from: "TOPIC",
	queue: "IncrementSalesCount",
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
				service.increaseSalesCount({
					storeId: d.storeId,
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

export const incrementSalesCount = sqsManager.getHandler(__dirname, __filename);
