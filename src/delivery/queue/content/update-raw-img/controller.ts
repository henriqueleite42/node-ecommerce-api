import { ContentService } from "factories/content";
import { makeController } from "helpers/make-controller";
import type { FileUploadedMsg } from "providers/upload-manager";
import { getSqsSnsMessage } from "utils/events/get-sqs-sns-message";

export const controller = makeController(
	async ({ event }) => {
		const { fileUrl, id } = getSqsSnsMessage<FileUploadedMsg>(event);

		const service = new ContentService().getInstance();

		await service.edit({
			storeId: id.storeId,
			productId: id.productId,
			contentId: id.contentId,
			rawContentPath: fileUrl,
			processedContentPath: fileUrl, // Temporary
		});
	},
	{
		isPublic: true,
	},
);
