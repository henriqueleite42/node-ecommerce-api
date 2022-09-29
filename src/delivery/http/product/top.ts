/* eslint-disable @typescript-eslint/no-magic-numbers */

import { ProductService } from "../../../factories/product";
import type { DeliveryManager } from "../../../providers/delivery-manager";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";

export const top = (server: DeliveryManager) => {
	server.addRoute<undefined>(
		{
			method: "GET",
			path: "products/top",
		},
		route =>
			route.setAuth(new AuthManagerProvider(["DISCORD"])).setFunc(() => {
				const service = new ProductService().getInstance();

				return service.getTop();
			}),
	);
};
