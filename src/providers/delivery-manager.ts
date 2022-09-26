/* eslint-disable @typescript-eslint/no-magic-numbers */

import type { Service } from "../factories";

import type { Lambda } from "../types/aws";

export abstract class DeliveryManager<C, F, U> {
	protected func: F;

	protected service: Service<U>;

	public constructor(protected readonly config: C) {}

	// Abstract

	public abstract setFunc(...p: any): this;

	public abstract getHandler(dirName: string, fileName: string): Lambda;

	// Public

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
