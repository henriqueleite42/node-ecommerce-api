/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { APIGatewayEvent, Callback, Context } from "aws-lambda";

import type { Service } from "../factories";

import type { AuthManager } from "./auth-manager";
import type { Validator } from "./validator";

import type { StatusCodeEnum } from "../types/enums/status-code";

interface RouteOutput {
	statusCode: StatusCodeEnum;
	body?: string;
}

type Func = (
	event: APIGatewayEvent,
	context: Context,
	callback: Callback,
) => Promise<RouteOutput>;

interface Config {
	method: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
	path: string;
	statusCode?: StatusCodeEnum;
}

export abstract class HttpManager<U, I> {
	protected func: Func;

	protected service: Service<U>;

	protected authManager: AuthManager;

	protected validationManager: Validator<I>;

	public constructor(protected readonly config: Config) {}

	public abstract setAuth(p: AuthManager): this;

	public setValidation(validationManager: Validator<I>) {
		this.validationManager = validationManager;

		return this;
	}

	protected getAuthHeader(headers?: Record<string, any>) {
		return headers?.authorization || headers?.Authorization || "";
	}

	public abstract setFunc(p: keyof U): this;

	public setService(service: Service<U>) {
		this.service = service;

		return this;
	}

	public getFunc() {
		return this.func;
	}

	// Protected

	protected getHandlerPath(dirName: string, fileName: string) {
		const path = `${dirName
			.split(process.cwd())[1]
			.substring(1)
			.replace(/\\/g, "/")}`;

		const funcName = fileName.split("/")!.pop()!.split(".")!.shift()!;

		return `${path}/${funcName}.func`;
	}
}
