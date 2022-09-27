/* eslint-disable @typescript-eslint/no-magic-numbers */

/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { StoreService } from "../../../factories/store";
import type { EditInput, StoreUseCase } from "../../../models/store";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { LambdaProvider } from "../../../providers/implementations/lambda";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

const httpManager = new LambdaProvider<StoreUseCase, EditInput>({
	method: "PATCH",
	path: "stores",
})
	.setAuth(new AuthManagerProvider(["BOT"]))
	.setValidation(
		new ValidatorProvider([
			{
				key: "storeId",
				as: "accountId",
				loc: "auth",
				validations: [Validations.required, Validations.uuid],
			},
			{
				key: "description",
				loc: "body",
				validations: [Validations.maxLength(500)],
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

export const func = httpManager.setFunc("edit").getFunc();

/**
 *
 * Handler
 *
 */

export const edit = httpManager.getHandler(__dirname, __filename);
