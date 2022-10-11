import { AccountService } from "../../../factories/account";
import type { CreateWithDiscordIdInput } from "../../../models/account";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const getByDiscordId = (serverInstance: HttpManager) => {
	serverInstance.addRoute<CreateWithDiscordIdInput>(
		{
			method: "GET",
			path: "accounts/discord",
			auth: ["DISCORD"],
			validations: [
				{
					key: "discordId",
					loc: "query",
					validations: [Validations.required, Validations.discordId],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new AccountService().getInstance();

				return service.getByDiscordId(p);
			}),
	);
};
