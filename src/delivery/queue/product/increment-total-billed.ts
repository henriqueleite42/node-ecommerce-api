/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { ProductService } from "factories/product";
import type { ProductUseCase } from "models/product";
import type { SaleEntity } from "models/sale";
import { SQSProvider } from "providers/implementations/sqs";

const sqsManager = new SQSProvider<SaleEntity, ProductUseCase>({
	from: "TOPIC",
	domain: "product",
	queue: "IncrementTotalBilled",
}).setService(new ProductService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await Promise.all(
			data.products.map(({ productId, price }) =>
				service.increaseTotalBilled({
					storeId: data.storeId,
					productId,
					amount: price,
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
