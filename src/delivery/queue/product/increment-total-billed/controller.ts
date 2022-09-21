import { ProductService } from "factories/product";
import { makeController } from "helpers/make-controller";
import type { SaleEntity } from "models/sale";
import { getSqsSnsMessage } from "utils/events/get-sqs-sns-message";

export const controller = makeController(
	async ({ event }) => {
		const { storeId, products } = getSqsSnsMessage<SaleEntity>(event);

		const service = new ProductService().getInstance();

		await Promise.all(
			products.map(({ productId, price }) =>
				service.increaseTotalBilled({
					storeId,
					productId,
					amount: price,
				}),
			),
		);
	},
	{
		isPublic: true,
	},
);
