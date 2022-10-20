import { StoreService } from "../../../factories/store";
import type { EditInput } from "../../../models/store";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const edit = (server: HttpManager) => {
	server.addRoute<EditInput>(
		{
			method: "PATCH",
			path: "stores",
			auth: ["DISCORD_USER"],
			validations: [
				{
					key: "storeId",
					as: "accountId",
					loc: "auth",
					validations: [Validations.required, Validations.id],
				},
				{
					key: "gender",
					loc: "body",
					validations: [Validations.gender],
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
			],
		},
		route =>
			route.setFunc(p => {
				const service = new StoreService().getInstance();

				return service.edit(p);
			}),
	);
};
