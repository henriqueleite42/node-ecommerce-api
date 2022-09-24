/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { AccountService } from "factories/account";
import { Validations } from "providers/implementations/validations";

import type {
	AccountUseCase,
	GetByDiscordIdOutput,
} from "../../../models/account";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { LambdaProvider } from "../../../providers/implementations/lambda";
import { ValidatorProvider } from "../../../providers/implementations/validator";

const httpManager = new LambdaProvider<AccountUseCase, GetByDiscordIdOutput>({
	method: "POST",
	path: "accounts/discord/{discordId}",
})
	.setAuth(new AuthManagerProvider(["BOT"]))
	.setValidation(
		new ValidatorProvider([
			{
				key: "discordId",
				loc: "query",
				validations: [Validations.required, Validations.discordId],
			},
		]),
	)
	.setService(new AccountService());

/**
 *
 * Func
 *
 */

export const func = httpManager.setFunc("getByDiscordId").getFunc();

/**
 *
 * Handler
 *
 */

export const getByDiscordId = httpManager.getHandler(__dirname, __filename);
