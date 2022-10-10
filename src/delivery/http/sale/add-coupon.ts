import { SaleService } from "../../../factories/sale";
import type { AddCouponInput } from "../../../models/sale";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const addCoupon = (server: HttpManager) => {
	server.addRoute<AddCouponInput>(
		{
			method: "PATCH",
			path: "sales/add-coupon",
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
					key: "coupon",
					loc: "body",
					validations: [Validations.required, Validations.couponCode],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new SaleService().getInstance();

				return service.addCoupon(p);
			}),
	);
};
