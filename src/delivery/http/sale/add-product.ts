/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { SaleService } from "../../../factories/sale";
import type { AddProductSaleInput, SaleUseCase } from "../../../models/sale";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { LambdaProvider } from "../../../providers/implementations/lambda";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

const httpManager = new LambdaProvider<SaleUseCase, AddProductSaleInput>({
	method: "PATCH",
	path: "sales/add-product",
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
				key: "product",
				loc: "body",
				validations: [
					Validations.required,
					Validations.obj([
						{
							key: "productId",
							validations: [Validations.required, Validations.code],
						},
						{
							key: "variationId",
							validations: [Validations.code],
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

export const func = httpManager.setFunc("addProduct").getFunc();

/**
 *
 * Handler
 *
 */

export const addProduct = httpManager.getHandler(__dirname, __filename);
