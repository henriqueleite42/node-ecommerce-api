import { SaleService } from "../../../factories/sale";
import type { ConfirmDeliveryInput } from "../../../models/sale";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const confirmDelivery = (server: HttpManager) => {
	server.addRoute<ConfirmDeliveryInput>(
		{
			method: "POST",
			path: "sales/confirm-delivery",
			auth: ["DISCORD_USER", "REST_USER"],
			validations: [
				{
					key: "clientId",
					as: "accountId",
					loc: "auth",
					validations: [Validations.required, Validations.id],
				},
				{
					key: "saleId",
					loc: "body",
					validations: [Validations.required, Validations.id],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new SaleService().getInstance();

				return service.confirmDelivery(p);
			}),
	);
};
