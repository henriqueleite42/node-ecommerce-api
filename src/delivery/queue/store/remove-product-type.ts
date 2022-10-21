/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { StoreService } from "../../../factories/store";
import type { ProductEntity } from "../../../models/product";
import type { StoreUseCase } from "../../../models/store";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<ProductEntity, StoreUseCase>({
	from: "TOPIC",
	queue: "RemoveProductType",
}).setService(new StoreService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await Promise.allSettled(data.map(service.removeProductType));
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const removeProductType = sqsManager.getHandler(__dirname, __filename);
