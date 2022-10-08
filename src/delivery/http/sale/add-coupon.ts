import { SaleService } from "../../../factories/sale";
import type { AddCouponInput } from "../../../models/sale";
import type { DeliveryManager } from "../../../providers/delivery-manager";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

export const addCoupon = (server: DeliveryManager) => {
	server.addRoute<AddCouponInput>(
		{
			method: "PATCH",
			path: "sales/add-coupon",
		},
		route =>
			route
				.setAuth(new AuthManagerProvider(["DISCORD_USER"]))
				.setValidator(
					new ValidatorProvider([
						{
							key: "clientId",
							as: "accountId",
							loc: "auth",
							validations: [Validations.required, Validations.uuid],
						},
						{
							key: "saleId",
							loc: "body",
							validations: [Validations.required, Validations.uuid],
						},
						{
							key: "coupon",
							loc: "body",
							validations: [Validations.required, Validations.couponCode],
						},
					]),
				)
				.setFunc(p => {
					const service = new SaleService().getInstance();

					return service.addCoupon(p);
				}),
	);
};
