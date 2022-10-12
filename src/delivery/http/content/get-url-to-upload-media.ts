/* eslint-disable @typescript-eslint/naming-convention */

import { ContentService } from "../../../factories/content";
import type { GetUrlToUploadRawMediaInput } from "../../../models/content";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const getUrlToUploadMedia = (server: HttpManager) => {
	server.addRoute<GetUrlToUploadRawMediaInput>(
		{
			method: "GET",
			path: "content/upload-media",
			auth: ["REST_USER"],
			validations: [
				{
					key: "storeId",
					loc: "auth",
					validations: [Validations.required, Validations.id],
				},
				{
					key: "productId",
					loc: "query",
					validations: [Validations.required, Validations.code],
				},
				{
					key: "contentId",
					loc: "query",
					validations: [Validations.required, Validations.id],
				},
				{
					key: "type",
					loc: "query",
					validations: [Validations.required, Validations.mediaType],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new ContentService().getInstance();

				return service.getUrlToUploadRawMedia(p);
			}),
	);
};
