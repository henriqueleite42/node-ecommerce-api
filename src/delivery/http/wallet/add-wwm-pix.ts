/* eslint-disable @typescript-eslint/no-magic-numbers */

/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { WalletService } from "../../../factories/wallet";
import type { AddWWMPixInput, WalletUseCase } from "../../../models/wallet";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { LambdaProvider } from "../../../providers/implementations/lambda";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

const httpManager = new LambdaProvider<WalletUseCase, AddWWMPixInput>({
	method: "POST",
	path: "wallets/wwm/pix",
})
	.setAuth(new AuthManagerProvider(["BOT"]))
	.setValidation(
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
	.setService(new WalletService());

/**
 *
 * Func
 *
 */

export const func = httpManager.setFunc("addWWMPix").getFunc();

/**
 *
 * Handler
 *
 */

export const addWWMPix = httpManager.getHandler(__dirname, __filename);
