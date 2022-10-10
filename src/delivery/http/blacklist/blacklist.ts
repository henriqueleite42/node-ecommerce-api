import { BlacklistService } from "../../../factories/blacklist";
import type { CreateInput } from "../../../models/blacklist";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const blacklist = (server: HttpManager) => {
	server.addRoute<CreateInput>(
		{
			method: "POST",
			path: "blacklist",
			auth: ["DISCORD_ADMIN"],
			validations: [
				{
					key: "accountId",
					loc: "body",
					validations: [Validations.required, Validations.discordId],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new BlacklistService().getInstance();

				return service.blacklist(p);
			}),
	);
};
