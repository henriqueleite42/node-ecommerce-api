import { StoreService } from "../../../factories/store";
import type { GetByIdInput } from "../../../models/store";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const getById = (server: HttpManager) => {
	server.addRoute<GetByIdInput>(
		{
			method: "GET",
			path: "stores/by-id",
			auth: ["DISCORD_BOT", "REST", "DISCORD_USER", "REST_USER"],
			validations: [
				{
					key: "storeId",
					loc: "query",
					validations: [Validations.required, Validations.id],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new StoreService().getInstance();

				return service.getById(p);
			}),
	);
};
