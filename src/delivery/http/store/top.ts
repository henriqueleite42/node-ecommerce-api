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

import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { LambdaProvider } from "../../../providers/implementations/lambda";

const httpManager = new LambdaProvider<StoreUseCase, GetByNameInput>({
	method: "GET",
	path: "stores/top",
})
	.setAuth(new AuthManagerProvider(["BOT"]))
	.setService(new StoreService());

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
