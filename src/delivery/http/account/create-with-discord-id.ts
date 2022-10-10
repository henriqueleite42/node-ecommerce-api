import { AccountService } from "../../../factories/account";
import type { CreateWithDiscordIdInput } from "../../../models/account";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

import { StatusCodeEnum } from "../../../types/enums/status-code";

export const createWithDiscordId = (server: HttpManager) => {
	server.addRoute<CreateWithDiscordIdInput>(
		{
			method: "POST",
			path: "accounts/bot/discord",
			statusCode: StatusCodeEnum.CREATED,
			auth: ["DISCORD"],
			validations: [
				{
					key: "discordId",
					loc: "body",
					validations: [Validations.required, Validations.discordId],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new AccountService().getInstance();

				return service.createWithDiscordId(p);
			}),
	);
};
