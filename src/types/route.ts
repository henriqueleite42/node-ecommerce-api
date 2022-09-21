import type { Callback, Context } from "aws-lambda";

import type { StatusCodeEnum } from "./enums/status-code";

interface RouteInput<T> {
	event: T;
	context: Context;
	callback: Callback;
}

export interface RouteOutput {
	headers?: Record<string, any>;
	statusCode: StatusCodeEnum;
	body?: string;
}

export type Func<T> = (
	p: RouteInput<T>,
) => Promise<RouteOutput> | Promise<void> | RouteOutput | void;
