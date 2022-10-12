/* eslint-disable @typescript-eslint/naming-convention */

import { ContentService } from "../../../factories/content";
import type { GetContentFileInput } from "../../../models/content";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const getContentFile = (server: HttpManager) => {
	server.addRoute<GetContentFileInput>(
		{
			method: "GET",
			path: "content/:storeId/:productId/:contentId",
			auth: ["REST_USER"],
			validations: [
				{
					key: "accountId",
					loc: "auth",
					validations: [Validations.required, Validations.id],
				},
				{
					key: "storeId",
					loc: "path",
					validations: [Validations.required, Validations.id],
				},
				{
					key: "productId",
					loc: "path",
					validations: [Validations.required, Validations.id],
				},
				{
					key: "contentId",
					loc: "path",
					validations: [Validations.required, Validations.id],
				},
			],
		},
		route =>
			route.setFunc(async (p, headers) => {
				const service = new ContentService().getInstance();

				const { contentType, file } = await service.getContentFile(p);

				headers.set("content-type", contentType);

				return file;
			}),
	);
};
