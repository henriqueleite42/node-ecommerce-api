import { S3Adapter } from "adapters/implementations/s3";
import { SQSAdapter } from "adapters/implementations/sqs";
import { makeController } from "helpers/make-controller";
import { UploadManagerProvider } from "providers/implementations/upload-manager";
import type { UploadFromUrlInput } from "providers/upload-manager";
import { getSqsSnsMessage } from "utils/events/get-sqs-sns-message";

export const controller = makeController(
	async ({ event }) => {
		const message = getSqsSnsMessage<UploadFromUrlInput>(event);

		const sqs = new SQSAdapter();
		const s3 = new S3Adapter();

		const uploadManager = new UploadManagerProvider(sqs, s3);

		await uploadManager.uploadFromUrl(message);
	},
	{
		isPublic: true,
	},
);
