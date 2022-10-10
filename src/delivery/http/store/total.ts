import { StoreService } from "../../../factories/store";
import type { HttpManager } from "../../../providers/http-manager";

export const total = (server: HttpManager) => {
	server.addRoute<undefined>(
		{
			method: "GET",
			path: "stores/total",
			auth: ["DISCORD"],
		},
		route =>
			route.setFunc(() => {
				const service = new StoreService().getInstance();

				return service.getStoresCount();
			}),
	);
};
