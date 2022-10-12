import { AccountService } from "../../../factories/account";
import type { RefreshInput } from "../../../models/account";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const refresh = (serverInstance: HttpManager) => {
	serverInstance.addRoute<RefreshInput>(
		{
			method: "POST",
			path: "accounts/refresh",
			auth: ["REST"],
			validations: [
				{
					key: "refreshToken",
					loc: "body",
					validations: [Validations.required, Validations.refreshToken],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new AccountService().getInstance();

				return service.refresh(p);
			}),
	);
};
