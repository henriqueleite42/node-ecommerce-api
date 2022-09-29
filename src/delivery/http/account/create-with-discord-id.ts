import { AccountService } from "../../../factories/account";
import type { CreateWithDiscordIdInput } from "../../../models/account";
import type { DeliveryManager } from "../../../providers/delivery-manager";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

import { StatusCodeEnum } from "../../../types/enums/status-code";

export const createWithDiscordId = (server: DeliveryManager) => {
	server.addRoute<CreateWithDiscordIdInput>(
		{
			method: "POST",
			path: "accounts/bot/discord",
			statusCode: StatusCodeEnum.CREATED,
		},
		route =>
			route
				.setAuth(new AuthManagerProvider(["DISCORD"]))
				.setValidator(
					new ValidatorProvider([
						{
							key: "discordId",
							loc: "body",
							validations: [Validations.required, Validations.discordId],
						},
					]),
				)
				.setFunc(p => {
					const service = new AccountService().getInstance();

					return service.createWithDiscordId(p);
				}),
	);
};
