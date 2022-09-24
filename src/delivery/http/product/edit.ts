/* eslint-disable @typescript-eslint/no-magic-numbers */

/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { ProductService } from "factories/product";
import type { EditInput, ProductUseCase } from "models/product";
import { Validations } from "providers/implementations/validations";

import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { LambdaProvider } from "../../../providers/implementations/lambda";
import { ValidatorProvider } from "../../../providers/implementations/validator";

const httpManager = new LambdaProvider<ProductUseCase, EditInput>({
	method: "PATCH",
	path: "products",
})
	.setAuth(new AuthManagerProvider(["BOT"]))
	.setValidation(
		new ValidatorProvider([
			{
				key: "productId",
				loc: "body",
				validations: [Validations.required, Validations.code],
			},
			{
				key: "storeId",
				loc: "body",
				validations: [Validations.required, Validations.uuid],
			},
			{
				key: "name",
				loc: "body",
				validations: [Validations.productName],
			},
			{
				key: "description",
				loc: "body",
				validations: [Validations.productDescription],
			},
			{
				key: "color",
				loc: "body",
				validations: [Validations.color],
			},
			{
				key: "price",
				loc: "body",
				validations: [Validations.money],
			},
			{
				key: "imageUrl",
				loc: "body",
				validations: [Validations.url],
			},
		]),
	)
	.setService(new ProductService());

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
