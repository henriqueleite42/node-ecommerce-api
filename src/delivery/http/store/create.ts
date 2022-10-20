import { StoreService } from "../../../factories/store";
import type { CreateInput } from "../../../models/store";
import type { HttpManager } from "../../../providers/http-manager";
import { Transform } from "../../../providers/implementations/transform";
import { Validations } from "../../../providers/implementations/validations";

import { StatusCodeEnum } from "../../../types/enums/status-code";

export const create = (server: HttpManager) => {
	server.addRoute<CreateInput>(
		{
			method: "POST",
			path: "stores",
			statusCode: StatusCodeEnum.CREATED,
			auth: ["DISCORD_USER"],
			validations: [
				{
					key: "accountId",
					loc: "auth",
					validations: [Validations.required, Validations.id],
				},
				{
					key: "gender",
					loc: "body",
					validations: [Validations.required, Validations.gender],
				},
				{
					key: "name",
					loc: "body",
					validations: [Validations.required, Validations.username],
					transform: [Transform.lowercase],
				},
				{
					key: "description",
					loc: "body",
					validations: [Validations.storeDescription],
					transform: [Transform.trim],
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

				return service.create(p);
			}),
	);
};
