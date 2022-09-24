/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { S3Adapter } from "adapters/implementations/s3";
import { SQSAdapter } from "adapters/implementations/sqs";
import { SQSProvider } from "providers/implementations/sqs";
import { UploadManagerProvider } from "providers/implementations/upload-manager";
import type { UploadFromUrlInput } from "providers/upload-manager";

const sqsManager = new SQSProvider<UploadFromUrlInput, undefined>({
	from: "QUEUE",
	queue: "UploadFromUrl",
});

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ data }) => {
		const sqs = new SQSAdapter();
		const s3 = new S3Adapter();

		const uploadManager = new UploadManagerProvider(sqs, s3);

		await uploadManager.uploadFromUrl(data);
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const fromUrl = sqsManager.getHandler(__dirname, __filename);
