import { ProductService } from "../../../factories/product";
import type { HttpManager } from "../../../providers/http-manager";

export const total = (server: HttpManager) => {
	server.addRoute<undefined>(
		{
			method: "GET",
			path: "products/total",
			auth: ["DISCORD_BOT", "REST", "DISCORD_USER", "REST_USER"],
		},
		route =>
			route.setFunc(() => {
				const service = new ProductService().getInstance();

				return service.getProductsCount();
			}),
	);
};
