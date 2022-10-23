/* eslint-disable @typescript-eslint/naming-convention */

import { ContentService } from "../../../factories/content";
import type { CreateInput } from "../../../models/content";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const getContentFile = (server: HttpManager) => {
	server.addRoute<CreateInput>(
		{
			method: "POST",
			path: "contents",
			auth: ["REST_USER"],
			validations: [
				{
					key: "storeId",
					loc: "auth",
					validations: [Validations.required, Validations.id],
				},
				{
					key: "productId",
					loc: "body",
					validations: [Validations.required, Validations.code],
				},
				{
					key: "type",
					loc: "body",
					validations: [Validations.required, Validations.mediaType],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new ContentService().getInstance();

				return service.create(p);
			}),
	);
};
