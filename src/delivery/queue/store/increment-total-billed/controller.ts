import { StoreService } from "factories/store";
import { makeController } from "helpers/make-controller";
import type { SaleEntity } from "models/sale";
import { getSqsSnsMessage } from "utils/events/get-sqs-sns-message";

export const controller = makeController(
	async ({ event }) => {
		const { storeId, finalPrice } = getSqsSnsMessage<SaleEntity>(event);

		const service = new StoreService().getInstance();

		await service.increaseTotalBilled({
			storeId,
			amount: finalPrice,
		});
	},
	{
		isPublic: true,
	},
);
