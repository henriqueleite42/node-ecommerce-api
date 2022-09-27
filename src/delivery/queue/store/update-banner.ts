/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { StoreService } from "../../../factories/store";
import type { StoreUseCase } from "../../../models/store";
import { SQSProvider } from "../../../providers/implementations/sqs";
import type { FileUploadedMsg } from "../../../providers/upload-manager";

const sqsManager = new SQSProvider<FileUploadedMsg, StoreUseCase>({
	from: "QUEUE",
	queue: "UpdateBanner",
}).setService(new StoreService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await service.edit({
			storeId: data.id.storeId,
			bannerUrl: data.filePath,
		});
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const updateBanner = sqsManager.getHandler(__dirname, __filename);
