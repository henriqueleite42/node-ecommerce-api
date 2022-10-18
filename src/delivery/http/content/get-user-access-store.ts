/* eslint-disable @typescript-eslint/naming-convention */

import { ContentService } from "../../../factories/content";
import type { GetUserAccessStoresInput } from "../../../models/content";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const getUserAccessStores = (server: HttpManager) => {
	server.addRoute<GetUserAccessStoresInput>(
		{
			method: "GET",
			path: "content/access/stores",
			auth: ["REST_USER"],
			validations: [
				{
					key: "accountId",
					loc: "auth",
					validations: [Validations.required, Validations.id],
				},
				{
					key: "limit",
					loc: "query",
					validations: [Validations.required, Validations.limit],
				},
				{
					key: "cursor",
					loc: "query",
					validations: [Validations.required, Validations.cursor],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new ContentService().getInstance();

				return service.getUserAccessStores(p);
			}),
	);
};
