/* eslint-disable @typescript-eslint/no-magic-numbers */

/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { StoreService } from "../../../factories/store";
import type { CreateInput, StoreUseCase } from "../../../models/store";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { LambdaProvider } from "../../../providers/implementations/lambda";
import { Transform } from "../../../providers/implementations/transform";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

import { StatusCodeEnum } from "../../../types/enums/status-code";

const httpManager = new LambdaProvider<StoreUseCase, CreateInput>({
	method: "POST",
	path: "stores",
	statusCode: StatusCodeEnum.CREATED,
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
				key: "name",
				loc: "body",
				validations: [Validations.required, Validations.username],
				transform: [Transform.lowercase],
			},
			{
				key: "description",
				loc: "body",
				validations: [Validations.maxLength(500)],
				transform: [Transform.trim],
			},
			{
				key: "color",
				loc: "body",
				validations: [Validations.color],
			},
			{
				key: "bannerUrl",
				loc: "body",
				validations: [Validations.url],
			},
			{
				key: "avatarUrl",
				loc: "body",
				validations: [Validations.url],
			},
		]),
	)
	.setService(new StoreService());

/**
 *
 * Func
 *
 */

export const func = httpManager.setFunc("create").getFunc();

/**
 *
 * Handler
 *
 */

export const create = httpManager.getHandler(__dirname, __filename);
