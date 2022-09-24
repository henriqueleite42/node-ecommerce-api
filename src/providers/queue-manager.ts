import type { Callback, Context, SQSEvent } from "aws-lambda";

import { DeliveryManager } from "./delivery-manager";

interface RouteInput {
	event: SQSEvent;
	context: Context;
	callback: Callback;
}

type RouteOutput = void;

type Func = (p: RouteInput) => RouteOutput;

interface Config {
	from: "QUEUE" | "TOPIC";
	queue: string;
}

interface SetFuncInput<D, U> {
	data: D;
	service: U;
}

export type SetFunc<D, U> = (p: SetFuncInput<D, U>) => Promise<void> | void;

export abstract class QueueManager<D, U> extends DeliveryManager<
	Config,
	Func,
	U
> {
	public abstract setFunc(f: SetFunc<D, U>): this;
}
