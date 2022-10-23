/* eslint-disable @typescript-eslint/no-magic-numbers */

import { ProductService } from "../../../factories/product";
import type { GetUrlToUploadImgInput } from "../../../models/product";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const getUrlToUploadImg = (server: HttpManager) => {
	server.addRoute<GetUrlToUploadImgInput>(
		{
			method: "GET",
			path: "products/upload-img",
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
			],
		},
		route =>
			route.setFunc(p => {
				const service = new ProductService().getInstance();

				return service.getUrlToUploadImg(p);
			}),
	);
};
