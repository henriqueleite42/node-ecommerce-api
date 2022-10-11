import { StoreService } from "../../../factories/store";
import type { GetByNameInput } from "../../../models/store";
import type { HttpManager } from "../../../providers/http-manager";
import { Transform } from "../../../providers/implementations/transform";
import { Validations } from "../../../providers/implementations/validations";

export const getByName = (server: HttpManager) => {
	server.addRoute<GetByNameInput>(
		{
			method: "GET",
			path: "stores",
			auth: ["DISCORD_BOT", "REST", "DISCORD_USER", "REST_USER"],
			validations: [
				{
					key: "name",
					loc: "query",
					validations: [Validations.required, Validations.username],
					transform: [Transform.lowercase],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new StoreService().getInstance();

				return service.getByName(p);
			}),
	);
};
