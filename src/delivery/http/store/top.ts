import { StoreService } from "../../../factories/store";
import type { HttpManager } from "../../../providers/http-manager";

export const top = (server: HttpManager) => {
	server.addRoute<undefined>(
		{
			method: "GET",
			path: "stores/top",
			auth: ["DISCORD"],
		},
		route =>
			route.setFunc(() => {
				const service = new StoreService().getInstance();

				return service.getTop();
			}),
	);
};
