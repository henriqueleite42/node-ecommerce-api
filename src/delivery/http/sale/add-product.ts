import { SaleService } from "../../../factories/sale";
import type { AddProductSaleInput } from "../../../models/sale";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const addProduct = (server: HttpManager) => {
	server.addRoute<AddProductSaleInput>(
		{
			method: "PATCH",
			path: "sales/add-product",
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
			],
		},
		route =>
			route.setFunc(p => {
				const service = new SaleService().getInstance();

				return service.addProduct(p);
			}),
	);
};
