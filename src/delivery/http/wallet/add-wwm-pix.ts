import { WalletService } from "../../../factories/wallet";
import type { AddWWMPixInput } from "../../../models/wallet";
import type { DeliveryManager } from "../../../providers/delivery-manager";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

export const addWWMPix = (server: DeliveryManager) => {
	server.addRoute<AddWWMPixInput>(
		{
			method: "POST",
			path: "wallets/wwm/pix",
		},
		route =>
			route
				.setAuth(new AuthManagerProvider(["DISCORD_USER"]))
				.setValidator(
					new ValidatorProvider([
						{
							key: "accountId",
							loc: "auth",
							validations: [Validations.required, Validations.uuid],
						},
						{
							key: "pixKey",
							loc: "body",
							validations: [Validations.required, Validations.pixKey],
						},
					]),
				)
				.setFunc(p => {
					const service = new WalletService().getInstance();

					return service.addWWMPix(p);
				}),
	);
};
