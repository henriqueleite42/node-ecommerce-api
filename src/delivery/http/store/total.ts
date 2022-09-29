import { StoreService } from "../../../factories/store";
import type { DeliveryManager } from "../../../providers/delivery-manager";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";

export const total = (server: DeliveryManager) => {
	server.addRoute<undefined>(
		{
			method: "GET",
			path: "stores/total",
		},
		route =>
			route.setAuth(new AuthManagerProvider(["DISCORD"])).setFunc(() => {
				const service = new StoreService().getInstance();

				return service.getStoresCount();
			}),
	);
};
