import { SaleService } from "../../../factories/sale";
import type { CheckoutSaleInput } from "../../../models/sale";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const checkout = (server: HttpManager) => {
	server.addRoute<CheckoutSaleInput>(
		{
			method: "POST",
			path: "sales/checkout",
			auth: ["DISCORD_USER"],
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
				{
					key: "paymentMethod",
					loc: "body",
					validations: [Validations.required, Validations.paymentMethod],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new SaleService().getInstance();

				return service.checkout(p);
			}),
	);
};
