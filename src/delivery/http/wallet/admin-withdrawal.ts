/* eslint-disable @typescript-eslint/no-magic-numbers */

/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { WalletService } from "../../../factories/wallet";
import type {
	AdminWithdrawalInput,
	WalletUseCase,
} from "../../../models/wallet";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { LambdaProvider } from "../../../providers/implementations/lambda";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

const httpManager = new LambdaProvider<WalletUseCase, AdminWithdrawalInput>({
	method: "POST",
	path: "wallets/admin-withdrawal",
})
	.setAuth(new AuthManagerProvider(["BOT_ADM"]))
	.setValidation(
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
	.setService(new WalletService());

/**
 *
 * Func
 *
 */

export const func = httpManager.setFunc("adminWithdrawal").getFunc();

/**
 *
 * Handler
 *
 */

export const adminWithdrawal = httpManager.getHandler(__dirname, __filename);
