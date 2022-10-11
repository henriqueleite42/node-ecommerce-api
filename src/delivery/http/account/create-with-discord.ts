import { AccountService } from "../../../factories/account";
import type { CreateAccountWithDiscordInput } from "../../../models/account";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

import { StatusCodeEnum } from "../../../types/enums/status-code";

export const createWithDiscord = (server: HttpManager) => {
	server.addRoute<CreateAccountWithDiscordInput>(
		{
			method: "POST",
			path: "accounts/discord",
			statusCode: StatusCodeEnum.CREATED,
			auth: ["DISCORD"],
			validations: [
				{
					key: "code",
					loc: "body",
					validations: [Validations.required, Validations.string],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new AccountService().getInstance();

				return service.createWithDiscord(p);
			}),
	);
};
