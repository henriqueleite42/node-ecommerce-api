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
import type { FileUploadedMsg } from "../../../providers/upload-manager";

const sqsManager = new SQSProvider<FileUploadedMsg, ProductUseCase>({
	from: "QUEUE",
	queue: "UpdateImage",
}).setService(new ProductService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await service.updateImg({
			storeId: data.id.storeId,
			productId: data.id.productId,
			imageUrl: data.fileUrl,
		});
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const updateImg = sqsManager.getHandler(__dirname, __filename);
