/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { ContentService } from "../../../factories/content";
import type { ContentUseCase } from "../../../models/content";
import { SQSProvider } from "../../../providers/implementations/sqs";
import type { FileUploadedMsg } from "../../../providers/upload-manager";

const sqsManager = new SQSProvider<FileUploadedMsg, ContentUseCase>({
	from: "QUEUE",
	queue: "UpdateRawImg",
}).setService(new ContentService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await service.edit({
			storeId: data.id.storeId,
			productId: data.id.productId,
			contentId: data.id.contentId,
			rawContentPath: data.fileUrl,
			processedContentPath: data.fileUrl, // Temporary
		});
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const updateRawImg = sqsManager.getHandler(__dirname, __filename);
