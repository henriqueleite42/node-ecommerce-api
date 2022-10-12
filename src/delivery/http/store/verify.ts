import { StoreService } from "../../../factories/store";
import type { VerifyInput } from "../../../models/store";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const edit = (server: HttpManager) => {
	server.addRoute<VerifyInput>(
		{
			method: "PATCH",
			path: "stores/verify",
			auth: ["DISCORD_ADMIN", "REST_ADMIN"],
			validations: [
				{
					key: "storeId",
					loc: "body",
					validations: [Validations.required, Validations.id],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new StoreService().getInstance();

				return service.verify(p);
			}),
	);
};
