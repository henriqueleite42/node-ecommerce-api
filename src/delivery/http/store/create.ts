import { StoreService } from "../../../factories/store";
import type { CreateInput } from "../../../models/store";
import type { DeliveryManager } from "../../../providers/delivery-manager";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { Transform } from "../../../providers/implementations/transform";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

import { StatusCodeEnum } from "../../../types/enums/status-code";

export const create = (server: DeliveryManager) => {
	server.addRoute<CreateInput>(
		{
			method: "POST",
			path: "stores",
			statusCode: StatusCodeEnum.CREATED,
		},
		route =>
			route
				.setAuth(new AuthManagerProvider(["DISCORD_USER"]))
				.setValidator(
					new ValidatorProvider([
						{
							key: "accountId",
							loc: "auth",
							validations: [Validations.required, Validations.uuid],
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
					]),
				)
				.setFunc(p => {
					const service = new StoreService().getInstance();

					return service.create(p);
				}),
	);
};
