import { WalletService } from "factories/wallet";
import { makeController } from "helpers/make-controller";
import type { StoreEntity } from "models/store";
import { getSqsSnsMessage } from "utils/events/get-sqs-sns-message";

export const controller = makeController(
	async ({ event }) => {
		const { accountId } = getSqsSnsMessage<StoreEntity>(event);

		const service = new WalletService().getInstance();

		await service.create({
			accountId,
		});
	},
	{
		isPublic: true,
	},
);
