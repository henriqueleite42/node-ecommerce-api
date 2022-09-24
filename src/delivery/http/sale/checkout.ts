/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { SaleService } from "factories/sale";
import type { CheckoutSaleInput, SaleUseCase } from "models/sale";
import { Validations } from "providers/implementations/validations";

import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { LambdaProvider } from "../../../providers/implementations/lambda";
import { ValidatorProvider } from "../../../providers/implementations/validator";

const httpManager = new LambdaProvider<SaleUseCase, CheckoutSaleInput>({
	method: "POST",
	path: "sales/checkout",
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
				key: "saleId",
				loc: "body",
				validations: [Validations.required, Validations.uuid],
			},
			{
				key: "paymentMethod",
				loc: "body",
				validations: [Validations.required, Validations.paymentMethod],
			},
		]),
	)
	.setService(new SaleService());

/**
 *
 * Func
 *
 */

export const func = httpManager.setFunc("checkout").getFunc();

/**
 *
 * Handler
 *
 */

export const checkout = httpManager.getHandler(__dirname, __filename);
