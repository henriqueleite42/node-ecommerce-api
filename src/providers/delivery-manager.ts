/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-magic-numbers */

import type { AuthManager } from "./auth-manager";
import type { Validator } from "./validator";

type Func<I> = (
	p: I,
) => Promise<Record<string, any>> | Record<string, any> | undefined;

export type RouteMethods = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

export interface ExecFuncInput {
	body?: Record<string, any>;
	query?: Record<string, string>;
	headers?: Record<string, string>;
	path?: Record<string, string>;
}

export abstract class Route<I> {
	protected authManager?: AuthManager;

	protected validatorManager?: Validator<I>;

	protected func: Func<I>;

	public setAuth(authManager: AuthManager) {
		this.authManager = authManager;

		return this;
	}

	public setValidator(validatorManager: Validator<I>) {
		this.validatorManager = validatorManager;

		return this;
	}

	public setFunc(func: Func<I>) {
		this.func = func;

		return this;
	}

	protected async execFunc(params: ExecFuncInput) {
		const authHeader = this.getAuthHeader(params.headers);

		if (this.authManager) {
			this.authManager.isAuthorized(authHeader);
		}

		const input = {
			...params,
			auth: this.authManager?.getAuthData(authHeader) || {},
		};

		const validatedData = await this.validatorManager?.validate(input);

		return this.func(validatedData as any);
	}

	// Internal methods

	protected getAuthHeader(headers?: Record<string, any>) {
		return headers?.authorization || headers?.Authorization || "";
	}
}

export abstract class DeliveryManager {
	protected secretsToBeLoaded = [] as Array<string>;

	public abstract addRoute<I>(
		config: any,
		r: (route: Route<I>) => Route<I>,
	): this;
}
