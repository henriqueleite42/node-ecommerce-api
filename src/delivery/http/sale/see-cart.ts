/* eslint-disable @typescript-eslint/no-magic-numbers */

/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { SaleService } from "../../../factories/sale";
import type {
	GetByClientIdStatusInput,
	SaleUseCase,
} from "../../../models/sale";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { LambdaProvider } from "../../../providers/implementations/lambda";
import { Transform } from "../../../providers/implementations/transform";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

import { SalesStatusEnum } from "../../../types/enums/sale-status";

const httpManager = new LambdaProvider<SaleUseCase, GetByClientIdStatusInput>({
	method: "GET",
	path: "sales/cart",
})
	.setAuth(new AuthManagerProvider(["BOT"]))
	.setValidation(
		new ValidatorProvider([
			{
				key: "clientId",
				as: "accountId",
				loc: "auth",
				validations: [Validations.required, Validations.uuid],
			},
			{
				key: "status",
				transform: [Transform.default(SalesStatusEnum.IN_CART)],
			},
			{
				key: "limit",
				loc: "query",
				validations: [Validations.required, Validations.limit],
				transform: [Transform.int],
			},
			{
				key: "continueFrom",
				loc: "query",
				validations: [Validations.required, Validations.cursor],
			},
		]),
	)
	.setService(new SaleService());

/**
 *
 * Func
 *
 */

export const func = httpManager.setFunc("getByClientIdStatus").getFunc();

/**
 *
 * Handler
 *
 */

export const seeCart = httpManager.getHandler(__dirname, __filename);
