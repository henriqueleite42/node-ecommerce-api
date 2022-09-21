import { ProductService } from "factories/product";
import { makeController } from "helpers/make-controller";
import type { FileUploadedMsg } from "providers/upload-manager";
import { getSqsSnsMessage } from "utils/events/get-sqs-sns-message";

export const controller = makeController(
	async ({ event }) => {
		const { fileUrl, id } = getSqsSnsMessage<FileUploadedMsg>(event);

		const service = new ProductService().getInstance();

		await service.updateImg({
			storeId: id.storeId,
			productId: id.productId,
			imageUrl: fileUrl,
		});
	},
	{
		isPublic: true,
	},
);
