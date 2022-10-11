import { AccountService } from "../../../factories/account";
import type { CreateMagicLinkInput } from "../../../models/magic-link";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const createMagicLink = (serverInstance: HttpManager) => {
	serverInstance.addRoute<CreateMagicLinkInput>(
		{
			method: "POST",
			path: "accounts/magic-link",
			auth: ["DISCORD_BOT"],
			validations: [
				{
					key: "accountId",
					loc: "body",
					validations: [Validations.required, Validations.id],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new AccountService().getInstance();

				return service.createMagicLink(p);
			}),
	);
};
