import { SaleService } from "factories/sale";
import { makeController } from "helpers/make-controller";
import type { ProcessPaymentSaleInput } from "models/sale";
import { getSqsSnsMessage } from "utils/events/get-sqs-sns-message";

export const controller = makeController(
	async ({ event }) => {
		const { saleId } = getSqsSnsMessage<ProcessPaymentSaleInput>(event);

		const service = new SaleService().getInstance();

		await service.processPayment({ saleId });
	},
	{
		isPublic: true,
	},
);
