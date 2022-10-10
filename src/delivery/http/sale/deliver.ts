import { SaleService } from "../../../factories/sale";
import type { SetProductAsDeliveredInput } from "../../../models/sale";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const deliver = (server: HttpManager) => {
	server.addRoute<SetProductAsDeliveredInput>(
		{
			method: "POST",
			path: "sales/deliver",
			auth: ["DISCORD_USER"],
			validations: [
				{
					key: "storeId",
					as: "accountId",
					loc: "auth",
					validations: [Validations.required, Validations.id],
				},
				{
					key: "saleId",
					loc: "body",
					validations: [Validations.required, Validations.id],
				},
				{
					key: "productId",
					loc: "body",
					validations: [Validations.required, Validations.code],
				},
				{
					key: "variationId",
					loc: "body",
					validations: [Validations.code],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new SaleService().getInstance();

				return service.setProductAsDelivered(p);
			}),
	);
};
