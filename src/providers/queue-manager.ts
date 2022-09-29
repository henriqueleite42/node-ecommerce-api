/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { Callback, Context, SQSEvent } from "aws-lambda";

import type { Service } from "../factories";

type RouteOutput = void;

type Func = (
	event: SQSEvent,
	context: Context,
	callback: Callback,
) => RouteOutput;

interface Config {
	from: "QUEUE" | "TOPIC";
	queue: string;
}

interface SetFuncInput<D, U> {
	data: D;
	service: U;
}

export type SetFunc<D, U> = (p: SetFuncInput<D, U>) => Promise<void> | void;

export abstract class QueueManager<D, U> {
	protected func: Func;

	protected service: Service<U>;

	public constructor(protected readonly config: Config) {}

	public abstract setFunc(f: SetFunc<D, U>): this;

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
