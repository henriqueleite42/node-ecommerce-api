import { AccessService } from "factories/access";
import { makeController } from "helpers/make-controller";
import type { SaleEntity } from "models/sale";
import { getSqsSnsMessage } from "utils/events/get-sqs-sns-message";

export const controller = makeController(
	async ({ event }) => {
		const sale = getSqsSnsMessage<SaleEntity>(event);

		const service = new AccessService().getInstance();

		await service.createMany({
			accountId: sale.clientId,
			accesses: sale.products.map(p => ({
				storeId: sale.storeId,
				productId: p.productId,
				variationId: p.variationId,
			})),
		});
	},
	{
		isPublic: true,
	},
);
