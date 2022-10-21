/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { ProductService } from "../../../factories/product";
import type { ProductUseCase } from "../../../models/product";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<undefined, ProductUseCase>({
	from: "TOPIC",
	queue: "IncrementProductsCount",
}).setService(new ProductService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await Promise.allSettled(data.map(service.increaseProductsCount));
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const incrementProductsCount = sqsManager.getHandler(
	__dirname,
	__filename,
);
