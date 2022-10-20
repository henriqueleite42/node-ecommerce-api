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
		await service.increaseMediaCount({
			storeId: data.product.storeId,
			productId: data.product.productId,
			media: data.content.type,
		});
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const increaseMediaCount = sqsManager.getHandler(__dirname, __filename);
