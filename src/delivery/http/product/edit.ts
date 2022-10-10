/* eslint-disable @typescript-eslint/no-magic-numbers */

import { ProductService } from "../../../factories/product";
import type { EditInput } from "../../../models/product";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const edit = (server: HttpManager) => {
	server.addRoute<EditInput>(
		{
			method: "PATCH",
			path: "products",
			auth: ["DISCORD_USER"],
			validations: [
				{
					key: "storeId",
					as: "accountId",
					loc: "auth",
					validations: [Validations.required, Validations.id],
				},
				{
					key: "productId",
					loc: "body",
					validations: [Validations.required, Validations.code],
				},
				{
					key: "name",
					loc: "body",
					validations: [Validations.productName],
				},
				{
					key: "description",
					loc: "body",
					validations: [Validations.productDescription],
				},
				{
					key: "color",
					loc: "body",
					validations: [Validations.color],
				},
				{
					key: "price",
					loc: "body",
					validations: [Validations.productPrice],
				},
				{
					key: "imageUrl",
					loc: "body",
					validations: [Validations.url],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new ProductService().getInstance();

				return service.edit(p);
			}),
	);
};
