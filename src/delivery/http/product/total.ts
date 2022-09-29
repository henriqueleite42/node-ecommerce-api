import { ProductService } from "../../../factories/product";
import type { DeliveryManager } from "../../../providers/delivery-manager";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";

export const total = (server: DeliveryManager) => {
	server.addRoute<undefined>(
		{
			method: "GET",
			path: "products/total",
		},
		route =>
			route.setAuth(new AuthManagerProvider(["DISCORD"])).setFunc(() => {
				const service = new ProductService().getInstance();

				return service.getProductsCount();
			}),
	);
};
