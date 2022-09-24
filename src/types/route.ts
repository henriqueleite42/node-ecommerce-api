import type { StatusCodeEnum } from "./enums/status-code";

export interface RouteOutput {
	headers?: Record<string, any>;
	statusCode: StatusCodeEnum;
	body?: string;
}

export type Func = () =>
	| Promise<RouteOutput>
	| Promise<void>
	| RouteOutput
	| void;
