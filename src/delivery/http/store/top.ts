import { StoreService } from "../../../factories/store";
import type { DeliveryManager } from "../../../providers/delivery-manager";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";

export const top = (server: DeliveryManager) => {
	server.addRoute<undefined>(
		{
			method: "GET",
			path: "stores/top",
		},
		route =>
			route.setAuth(new AuthManagerProvider(["DISCORD"])).setFunc(() => {
				const service = new StoreService().getInstance();

				return service.getTop();
			}),
	);
};
