import { StoreService } from "../../../factories/store";
import type { CreateTopStoresInput } from "../../../models/store";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

import { StatusCodeEnum } from "../../../types/enums/status-code";

export const createTopStores = (server: HttpManager) => {
	server.addRoute<CreateTopStoresInput>(
		{
			method: "POST",
			path: "stores",
			statusCode: StatusCodeEnum.CREATED,
			auth: ["DISCORD_ADMIN"],
			validations: [
				{
					key: "storesNames",
					loc: "body",
					validations: [
						Validations.required,
						Validations.arrOf(Validations.id),
						Validations.arrayUnique(),
					],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new StoreService().getInstance();

				return service.createTopStores(p);
			}),
	);
};
