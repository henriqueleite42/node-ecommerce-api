import { AccountService } from "../../../factories/account";
import type { GetMagicLinkInput } from "../../../models/magic-link";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const signInWithMagicLink = (serverInstance: HttpManager) => {
	serverInstance.addRoute<GetMagicLinkInput>(
		{
			method: "POST",
			path: "accounts/magic-link",
			auth: ["REST"],
			validations: [
				{
					key: "token",
					loc: "body",
					validations: [Validations.required, Validations.token],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new AccountService().getInstance();

				return service.signInWithMagicLink(p);
			}),
	);
};
