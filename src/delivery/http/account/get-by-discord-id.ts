import { AccountService } from "../../../factories/account";
import type { AccountEntity } from "../../../models/account";
import type { DeliveryManager } from "../../../providers/delivery-manager";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

export const getByDiscordId = (serverInstance: DeliveryManager) => {
	serverInstance.addRoute<AccountEntity>(
		{
			method: "GET",
			path: "accounts/discord",
		},
		route =>
			route
				.setAuth(new AuthManagerProvider(["DISCORD"]))
				.setValidator(
					new ValidatorProvider([
						{
							key: "discordId",
							loc: "query",
							validations: [Validations.required, Validations.discordId],
						},
					]),
				)
				.setFunc(p => {
					const service = new AccountService().getInstance();

					return service.getByDiscordId(p);
				}),
	);
};
