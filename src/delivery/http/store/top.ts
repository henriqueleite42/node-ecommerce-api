import { StoreService } from "../../../factories/store";
import type { HttpManager } from "../../../providers/http-manager";

export const top = (server: HttpManager) => {
	server.addRoute<undefined>(
		{
			method: "GET",
			path: "stores/top",
			auth: ["DISCORD_BOT", "REST", "DISCORD_USER", "REST_USER"],
		},
		route =>
			route.setFunc(() => {
				const service = new StoreService().getInstance();

				return service.getTopStores();
			}),
	);
};
