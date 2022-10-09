import { StoreService } from "../../../factories/store";
import type { GetUrlToUploadImgInput } from "../../../models/store";
import type { DeliveryManager } from "../../../providers/delivery-manager";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

export const getUrlToUploadBanner = (server: DeliveryManager) => {
	server.addRoute<GetUrlToUploadImgInput>(
		{
			method: "PUT",
			path: "stores/url-upload-avatar",
		},
		route =>
			route
				.setAuth(new AuthManagerProvider(["DISCORD_USER"]))
				.setValidator(
					new ValidatorProvider([
						{
							key: "storeId",
							as: "accountId",
							loc: "auth",
							validations: [Validations.required, Validations.uuid],
						},
					]),
				)
				.setFunc(p => {
					const service = new StoreService().getInstance();

					return service.getUrlToUploadBanner(p);
				}),
	);
};
