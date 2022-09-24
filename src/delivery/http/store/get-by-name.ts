/* eslint-disable @typescript-eslint/no-magic-numbers */

/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { StoreService } from "factories/store";
import type { GetByNameInput, StoreUseCase } from "models/store";
import { Transform } from "providers/implementations/transform";
import { Validations } from "providers/implementations/validations";

import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { LambdaProvider } from "../../../providers/implementations/lambda";
import { ValidatorProvider } from "../../../providers/implementations/validator";

const httpManager = new LambdaProvider<StoreUseCase, GetByNameInput>({
	method: "GET",
	path: "stores",
})
	.setAuth(new AuthManagerProvider(["BOT"]))
	.setValidation(
		new ValidatorProvider([
			{
				key: "name",
				loc: "query",
				validations: [Validations.required, Validations.username],
				transform: [Transform.lowercase],
			},
		]),
	)
	.setService(new StoreService());

/**
 *
 * Func
 *
 */

export const func = httpManager.setFunc("getByName").getFunc();

/**
 *
 * Handler
 *
 */

export const getByName = httpManager.getHandler(__dirname, __filename);
