import { SaleService } from "../../../factories/sale";
import type { AddProductSaleInput } from "../../../models/sale";
import type { DeliveryManager } from "../../../providers/delivery-manager";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

export const addProduct = (server: DeliveryManager) => {
	server.addRoute<AddProductSaleInput>(
		{
			method: "PATCH",
			path: "sales/add-product",
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
							key: "product",
							loc: "body",
							validations: [
								Validations.required,
								Validations.obj([
									{
										key: "productId",
										validations: [Validations.required, Validations.code],
									},
									{
										key: "variationId",
										validations: [Validations.code],
									},
								]),
							],
						},
					]),
				)
				.setFunc(p => {
					const service = new SaleService().getInstance();

					return service.addProduct(p);
				}),
	);
};
