import { WalletService } from "factories/wallet";
import { makeController } from "helpers/make-controller";
import type { SaleEntity } from "models/sale";
import { getSqsSnsMessage } from "utils/events/get-sqs-sns-message";

export const controller = makeController(
	async ({ event }) => {
		const { storeId, finalPrice } = getSqsSnsMessage<SaleEntity>(event);

		const service = new WalletService().getInstance();

		await service.incrementBalance({
			accountId: storeId,
			amount: finalPrice,
		});
	},
	{
		isPublic: true,
	},
);
