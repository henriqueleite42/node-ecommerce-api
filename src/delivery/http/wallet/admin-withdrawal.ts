/* eslint-disable @typescript-eslint/no-magic-numbers */

import { WalletService } from "../../../factories/wallet";
import type { AdminWithdrawalInput } from "../../../models/wallet";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const adminWithdrawal = (server: HttpManager) => {
	server.addRoute<AdminWithdrawalInput>(
		{
			method: "POST",
			path: "wallets/admin-withdrawal",
			auth: ["DISCORD_ADMIN"],
			validations: [
				{
					key: "adminId",
					as: "accountId",
					loc: "auth",
					validations: [Validations.required, Validations.id],
				},
				{
					key: "accountId",
					loc: "body",
					validations: [Validations.required, Validations.id],
				},
				{
					key: "amount",
					loc: "body",
					validations: [
						Validations.required,
						Validations.money,
						Validations.min(5),
					],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new WalletService().getInstance();

				return service.adminWithdrawal(p);
			}),
	);
};
