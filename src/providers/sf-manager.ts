/* eslint-disable @typescript-eslint/no-magic-numbers */

import type { Callback, Context } from "aws-lambda";

import type { Service } from "../factories";

type RouteOutput = void;

type Func<E> = (event: E, context: Context, callback: Callback) => RouteOutput;

interface SetFuncInput<D, U> {
	data: D;
	service: U;
}

export type SetFunc<D, U> = (p: SetFuncInput<D, U>) => Promise<void> | void;

export abstract class SFManager<C, E, D, U> {
	protected func: Func<E>;

	protected service: Service<U>;

	public constructor(protected readonly config: C) {}

	public setFunc(func: SetFunc<D, U>) {
		this.func = async event => {
			try {
				const data = this.getData(event);

				const serviceInstance = this.service?.getInstance();

				await func({
					data,
					service: serviceInstance,
				});
			} catch (err: any) {
				console.error(err);
			}
		};

		return this;
	}

	public setService(service: Service<U>) {
		this.service = service;

		return this;
	}

	public getFunc() {
		return this.func;
	}

	// Protected

	protected abstract getData(event: E): D;

	protected getHandlerPath(dirName: string, fileName: string) {
		const path = `${dirName
			.split(process.cwd())[1]
			.substring(1)
			.replace(/\\/g, "/")}`;

		const funcName = fileName.split("/")!.pop()!.split(".")!.shift()!;

		return `${path}/${funcName}.func`;
	}
}
