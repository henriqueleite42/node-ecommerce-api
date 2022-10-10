/* eslint-disable @typescript-eslint/no-magic-numbers */

import { ProductService } from "../../../factories/product";
import type { DeleteInput } from "../../../models/product";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const del = (server: HttpManager) => {
	server.addRoute<DeleteInput>(
		{
			method: "DELETE",
			path: "products",
			auth: ["DISCORD_USER"],
			validations: [
				{
					key: "storeId",
					loc: "auth",
					validations: [Validations.required, Validations.id],
				},
				{
					key: "productId",
					loc: "query",
					validations: [Validations.required, Validations.code],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new ProductService().getInstance();

				return service.delete(p);
			}),
	);
};
