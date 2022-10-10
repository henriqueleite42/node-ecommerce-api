import { WalletService } from "../../../factories/wallet";
import type { AddWWMPixInput } from "../../../models/wallet";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const addWWMPix = (server: HttpManager) => {
	server.addRoute<AddWWMPixInput>(
		{
			method: "POST",
			path: "wallets/wwm/pix",
			auth: ["DISCORD_USER"],
			validations: [
				{
					key: "accountId",
					loc: "auth",
					validations: [Validations.required, Validations.id],
				},
				{
					key: "pixKey",
					loc: "body",
					validations: [Validations.required, Validations.pixKey],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new WalletService().getInstance();

				return service.addWWMPix(p);
			}),
	);
};
