/* eslint-disable @typescript-eslint/no-magic-numbers */

/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { ProductService } from "factories/product";
import type { GetProductsByTypeInput, ProductUseCase } from "models/product";
import { Validations } from "providers/implementations/validations";

import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { LambdaProvider } from "../../../providers/implementations/lambda";
import { ValidatorProvider } from "../../../providers/implementations/validator";

const httpManager = new LambdaProvider<ProductUseCase, GetProductsByTypeInput>({
	method: "GET",
	path: "products/paginated",
})
	.setAuth(new AuthManagerProvider(["BOT"]))
	.setValidation(
		new ValidatorProvider([
			{
				key: "storeId",
				loc: "query",
				validations: [Validations.required, Validations.uuid],
			},
			{
				key: "type",
				loc: "query",
				validations: [Validations.required, Validations.productType],
			},
			{
				key: "limit",
				loc: "query",
				validations: [Validations.required, Validations.limit],
			},
			{
				key: "continueFrom",
				loc: "query",
				validations: [Validations.required, Validations.cursor],
			},
		]),
	)
	.setService(new ProductService());

/**
 *
 * Func
 *
 */

export const func = httpManager.setFunc("getProductsByType").getFunc();

/**
 *
 * Handler
 *
 */

export const getPaginated = httpManager.getHandler(__dirname, __filename);
