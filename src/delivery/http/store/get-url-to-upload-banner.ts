import { StoreService } from "../../../factories/store";
import type { GetUrlToUploadImgInput } from "../../../models/store";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const getUrlToUploadBanner = (server: HttpManager) => {
	server.addRoute<GetUrlToUploadImgInput>(
		{
			method: "PUT",
			path: "stores/url-upload-avatar",
			auth: ["DISCORD_USER"],
			validations: [
				{
					key: "storeId",
					as: "accountId",
					loc: "auth",
					validations: [Validations.required, Validations.id],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new StoreService().getInstance();

				return service.getUrlToUploadBanner(p);
			}),
	);
};
