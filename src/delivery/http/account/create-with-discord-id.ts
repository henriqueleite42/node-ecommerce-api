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
	CreateWithDiscordIdInput,
} from "../../../models/account";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { LambdaProvider } from "../../../providers/implementations/lambda";
import { ValidatorProvider } from "../../../providers/implementations/validator";

import { StatusCodeEnum } from "../../../types/enums/status-code";

const httpManager = new LambdaProvider<
	AccountUseCase,
	CreateWithDiscordIdInput
>({
	method: "POST",
	path: "accounts/bot/discord",
	statusCode: StatusCodeEnum.CREATED,
})
	.setAuth(new AuthManagerProvider(["BOT"]))
	.setValidation(
		new ValidatorProvider([
			{
				key: "discordId",
				loc: "body",
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

export const func = httpManager.setFunc("createWithDiscordId").getFunc();

/**
 *
 * Handler
 *
 */

export const createWithDiscordId = httpManager.getHandler(
	__dirname,
	__filename,
);
