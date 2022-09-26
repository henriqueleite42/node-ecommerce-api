/* eslint-disable @typescript-eslint/no-magic-numbers */

/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { StoreService } from "../../../factories/store";
import type { GetByNameInput, StoreUseCase } from "../../../models/store";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { LambdaProvider } from "../../../providers/implementations/lambda";

const httpManager = new LambdaProvider<StoreUseCase, GetByNameInput>({
	method: "GET",
	path: "stores/total",
})
	.setAuth(new AuthManagerProvider(["BOT"]))
	.setService(new StoreService());

/**
 *
 * Func
 *
 */

export const func = httpManager.setFunc("getStoresCount").getFunc();

/**
 *
 * Handler
 *
 */

export const total = httpManager.getHandler(__dirname, __filename);
