import type { APIGatewayEvent, Callback, Context } from "aws-lambda";

import type { AuthManager } from "./auth-manager";
import { DeliveryManager } from "./delivery-manager";
import type { Validator } from "./validator";

import type { StatusCodeEnum } from "types/enums/status-code";

interface RouteInput {
	event: APIGatewayEvent;
	context: Context;
	callback: Callback;
}

interface RouteOutput {
	statusCode: StatusCodeEnum;
	body?: string;
}

type Func = (p: RouteInput) => Promise<RouteOutput>;

interface Config {
	method: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
	path: string;
	statusCode?: StatusCodeEnum;
}

export abstract class HttpManager<U, I> extends DeliveryManager<
	Config,
	Func,
	U
> {
	protected authManager: AuthManager;

	protected validationManager: Validator<I>;

	public abstract setAuth(p: AuthManager): this;

	public setValidation(validationManager: Validator<I>) {
		this.validationManager = validationManager;

		return this;
	}

	public abstract setFunc(p: keyof U): this;
}
