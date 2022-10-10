import { ProductService } from "../../../factories/product";
import type { HttpManager } from "../../../providers/http-manager";

export const top = (server: HttpManager) => {
	server.addRoute<undefined>(
		{
			method: "GET",
			path: "products/top",
			auth: ["DISCORD"],
		},
		route =>
			route.setFunc(() => {
				const service = new ProductService().getInstance();

				return service.getTop();
			}),
	);
};
