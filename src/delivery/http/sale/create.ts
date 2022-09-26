/* eslint-disable @typescript-eslint/no-magic-numbers */

/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { SaleService } from "../../../factories/sale";
import type { CreateSaleInput, SaleUseCase } from "../../../models/sale";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { LambdaProvider } from "../../../providers/implementations/lambda";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

import { StatusCodeEnum } from "../../../types/enums/status-code";

const httpManager = new LambdaProvider<SaleUseCase, CreateSaleInput>({
	method: "POST",
	path: "sales",
	statusCode: StatusCodeEnum.CREATED,
})
	.setAuth(new AuthManagerProvider(["BOT"]))
	.setValidation(
		new ValidatorProvider([
			{
				key: "storeId",
				loc: "body",
				validations: [Validations.required, Validations.uuid],
			},
			{
				key: "clientId",
				as: "accountId",
				loc: "auth",
				validations: [Validations.required, Validations.uuid],
			},
			{
				key: "origin",
				loc: "body",
				validations: [Validations.required, Validations.saleOrigin],
			},
			{
				key: "products",
				loc: "body",
				validations: [
					Validations.required,
					Validations.array,
					Validations.minLength(1),
					Validations.maxLength(1),
					Validations.arrOfObj([
						{
							key: "productId",
							validations: [Validations.required, Validations.code],
						},
						{
							key: "variationId",
							validations: [Validations.required, Validations.code],
						},
					]),
				],
			},
		]),
	)
	.setService(new SaleService());

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
