import type { ArrayAllowedAuthTypes, AuthManager } from "./auth-manager";
import { DeliveryManager, Route } from "./delivery-manager";
import type { Validations, Validator } from "./validator";

import { CustomError } from "../utils/error";

import { StatusCodeEnum } from "../types/enums/status-code";

type RouteMethods = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

type HttpRouteFunc<I> = (
	p: I,
	headers: Map<string, string>,
) => Promise<Record<string, any>> | Record<string, any> | undefined;

export interface HttpRouteConfig<I> {
	method: RouteMethods;
	path: string;
	statusCode?: StatusCodeEnum;
	auth?: ArrayAllowedAuthTypes;
	validations?: Array<Validations<I>>;
}

export interface ExecFuncInput {
	body?: Record<string, any>;
	query?: Record<string, string>;
	headers?: Record<string, string>;
	path?: Record<string, string>;
}

export class HttpRoute<I = any> extends Route<HttpRouteFunc<I>> {
	public constructor(
		protected readonly validatorManager: Validator<I> | undefined,
		protected readonly authManager: AuthManager | undefined,
		protected readonly config: HttpRouteConfig<I>,
	) {
		super();

		if (this.config.path.startsWith("/")) {
			throw new Error(`Routes ${this.config.path} cannot start with '/'`);
		}
	}

	public async execFunc(params: ExecFuncInput) {
		try {
			const authHeader = this.getAuthHeader(params.headers);

			if (this.authManager) {
				this.authManager.isAuthorized(authHeader);
			}

			const input = {
				...params,
				auth: this.authManager?.getAuthData(authHeader) || {},
			};

			const validatedData = await (this.validatorManager
				? this.validatorManager.validate(input)
				: input);

			const headers = new Map();
			const result = await this.func(validatedData as any, headers);

			return {
				statusCode: this.getStatusCode(),
				body: result,
				headers: Object.fromEntries(headers.entries()) as Record<
					string,
					string
				>,
			};
		} catch (err: any) {
			if (err instanceof CustomError) {
				return {
					statusCode: err.statusCode,
					body: err.getBody(),
				};
			}

			console.error(err);

			return {
				statusCode: StatusCodeEnum.INTERNAL,
			};
		}
	}

	public getMethod() {
		return this.config.method;
	}

	public getPath() {
		return this.config.path;
	}

	protected getStatusCode() {
		if (this.config.statusCode) return this.config.statusCode;

		switch (this.config.method) {
			case "DELETE":
				return StatusCodeEnum.NO_CONTENT;
			default:
				return StatusCodeEnum.SUCCESS;
		}
	}

	// Internal methods

	protected getAuthHeader(headers?: Record<string, any>) {
		return headers?.authorization || headers?.Authorization || "";
	}
}

export abstract class HttpManager extends DeliveryManager {
	protected secretsToBeLoaded = [] as Array<string>;

	public abstract addRoute<I>(
		config: HttpRouteConfig<I>,
		r: (route: HttpRoute<I>) => HttpRoute<I>,
	): this;
}
