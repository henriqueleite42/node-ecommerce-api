/* eslint-disable @typescript-eslint/no-magic-numbers */

import { ProductService } from "../../../factories/product";
import type { GetByIdInput } from "../../../models/product";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const getById = (server: HttpManager) => {
	server.addRoute<GetByIdInput>(
		{
			method: "GET",
			path: "products",
			auth: ["DISCORD_BOT", "REST", "DISCORD_USER", "REST_USER"],
			validations: [
				{
					key: "storeId",
					loc: "query",
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

				return service.getById(p);
			}),
	);
};
