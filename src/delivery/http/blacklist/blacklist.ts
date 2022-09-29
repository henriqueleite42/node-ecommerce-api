import { BlacklistService } from "../../../factories/blacklist";
import type { CreateInput } from "../../../models/blacklist";
import type { DeliveryManager } from "../../../providers/delivery-manager";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

export const blacklist = (server: DeliveryManager) => {
	server.addRoute<CreateInput>(
		{
			method: "POST",
			path: "blacklist",
		},
		route =>
			route
				.setAuth(new AuthManagerProvider(["DISCORD_ADMIN"]))
				.setValidator(
					new ValidatorProvider([
						{
							key: "accountId",
							loc: "body",
							validations: [Validations.required, Validations.discordId],
						},
					]),
				)
				.setFunc(p => {
					const service = new BlacklistService().getInstance();

					return service.blacklist(p);
				}),
	);
};
