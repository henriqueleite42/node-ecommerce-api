/* eslint-disable @typescript-eslint/no-magic-numbers */

import { WalletService } from "../../../factories/wallet";
import type { AdminWithdrawalInput } from "../../../models/wallet";
import type { DeliveryManager } from "../../../providers/delivery-manager";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

export const adminWithdrawal = (server: DeliveryManager) => {
	server.addRoute<AdminWithdrawalInput>(
		{
			method: "POST",
			path: "wallets/admin-withdrawal",
		},
		route =>
			route
				.setAuth(new AuthManagerProvider(["DISCORD_ADMIN"]))
				.setValidator(
					new ValidatorProvider([
						{
							key: "adminId",
							as: "accountId",
							loc: "auth",
							validations: [Validations.required, Validations.uuid],
						},
						{
							key: "accountId",
							loc: "body",
							validations: [Validations.required, Validations.uuid],
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
					]),
				)
				.setFunc(p => {
					const service = new WalletService().getInstance();

					return service.adminWithdrawal(p);
				}),
	);
};
