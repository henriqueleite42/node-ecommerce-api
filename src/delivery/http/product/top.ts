/* eslint-disable @typescript-eslint/no-magic-numbers */

/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { ProductService } from "factories/product";
import type { ProductUseCase } from "models/product";

import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { LambdaProvider } from "../../../providers/implementations/lambda";

const httpManager = new LambdaProvider<ProductUseCase, undefined>({
	method: "GET",
	path: "products/top",
})
	.setAuth(new AuthManagerProvider(["BOT"]))
	.setService(new ProductService());

/**
 *
 * Func
 *
 */

export const func = httpManager.setFunc("getTop").getFunc();

/**
 *
 * Handler
 *
 */

export const top = httpManager.getHandler(__dirname, __filename);
