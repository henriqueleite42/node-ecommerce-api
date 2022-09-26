/* eslint-disable @typescript-eslint/no-magic-numbers */

/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { ProductService } from "../../../factories/product";
import type { GetByIdInput, ProductUseCase } from "../../../models/product";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { LambdaProvider } from "../../../providers/implementations/lambda";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

const httpManager = new LambdaProvider<ProductUseCase, GetByIdInput>({
	method: "GET",
	path: "products",
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
				key: "productId",
				loc: "query",
				validations: [Validations.required, Validations.code],
			},
		]),
	)
	.setService(new ProductService());

/**
 *
 * Func
 *
 */

export const func = httpManager.setFunc("getById").getFunc();

/**
 *
 * Handler
 *
 */

export const getById = httpManager.getHandler(__dirname, __filename);
