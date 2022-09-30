import { SaleService } from "../../../factories/sale";
import type { SetProductAsDeliveredInput } from "../../../models/sale";
import type { DeliveryManager } from "../../../providers/delivery-manager";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

export const deliver = (server: DeliveryManager) => {
	server.addRoute<SetProductAsDeliveredInput>(
		{
			method: "POST",
			path: "sales/deliver",
		},
		route =>
			route
				.setAuth(new AuthManagerProvider(["DISCORD_USER"]))
				.setValidator(
					new ValidatorProvider([
						{
							key: "storeId",
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
							key: "productId",
							loc: "body",
							validations: [Validations.required, Validations.code],
						},
						{
							key: "variationId",
							loc: "body",
							validations: [Validations.code],
						},
					]),
				)
				.setFunc(p => {
					const service = new SaleService().getInstance();

					return service.setProductAsDelivered(p);
				}),
	);
};
