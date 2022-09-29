import { SaleService } from "../../../factories/sale";
import type { CheckoutSaleInput } from "../../../models/sale";
import type { DeliveryManager } from "../../../providers/delivery-manager";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

export const checkout = (server: DeliveryManager) => {
	server.addRoute<CheckoutSaleInput>(
		{
			method: "POST",
			path: "sales/checkout",
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
							key: "paymentMethod",
							loc: "body",
							validations: [Validations.required, Validations.paymentMethod],
						},
					]),
				)
				.setFunc(p => {
					const service = new SaleService().getInstance();

					return service.checkout(p);
				}),
	);
};
