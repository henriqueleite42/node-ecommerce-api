/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { ProductService } from "../../../factories/product";
import type { ContentCreatedMessage } from "../../../models/content";
import type { ProductUseCase } from "../../../models/product";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<ContentCreatedMessage, ProductUseCase>({
	from: "TOPIC",
	queue: "IncrementMediaCount",
}).setService(new ProductService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await Promise.allSettled(
			data.map(d =>
				service.increaseMediaCount({
					storeId: d.product.storeId,
					productId: d.product.productId,
					media: d.content.type,
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

export const increaseMediaCount = sqsManager.getHandler(__dirname, __filename);
