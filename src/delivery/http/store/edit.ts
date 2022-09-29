import { StoreService } from "../../../factories/store";
import type { EditInput } from "../../../models/store";
import type { DeliveryManager } from "../../../providers/delivery-manager";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

export const edit = (server: DeliveryManager) => {
	server.addRoute<EditInput>(
		{
			method: "PATCH",
			path: "stores",
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
						{
							key: "description",
							loc: "body",
							validations: [Validations.storeDescription],
						},
						{
							key: "color",
							loc: "body",
							validations: [Validations.color],
						},
						{
							key: "bannerUrl",
							loc: "body",
							validations: [Validations.url],
						},
						{
							key: "avatarUrl",
							loc: "body",
							validations: [Validations.url],
						},
					]),
				)
				.setFunc(p => {
					const service = new StoreService().getInstance();

					return service.edit(p);
				}),
	);
};
