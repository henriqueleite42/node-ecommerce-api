import { ProductService } from "../../../factories/product";
import type { GetProductsByTypeInput } from "../../../models/product";
import type { HttpManager } from "../../../providers/http-manager";
import { Transform } from "../../../providers/implementations/transform";
import { Validations } from "../../../providers/implementations/validations";

export const getPaginated = (server: HttpManager) => {
	server.addRoute<GetProductsByTypeInput>(
		{
			method: "GET",
			path: "products/paginated",
			auth: ["DISCORD_BOT", "REST", "DISCORD_USER", "REST_USER"],
			validations: [
				{
					key: "storeId",
					loc: "query",
					validations: [Validations.required, Validations.id],
				},
				{
					key: "type",
					loc: "query",
					validations: [Validations.required, Validations.productType],
				},
				{
					key: "limit",
					loc: "query",
					validations: [Validations.required, Validations.limit],
					transform: [Transform.int],
				},
				{
					key: "continueFrom",
					loc: "query",
					validations: [Validations.cursor],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new ProductService().getInstance();

				return service.getProductsByType(p);
			}),
	);
};
