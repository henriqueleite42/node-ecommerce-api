import type { SNSMessage, SQSEvent } from "aws-lambda";

import { SFManager } from "./sf-manager";

interface Config {
	from: "QUEUE" | "TOPIC";
	queue: string;
}

interface SetFuncInput<D, U> {
	data: D;
	service: U;
}

export type SetFunc<D, U> = (p: SetFuncInput<D, U>) => Promise<void> | void;

export abstract class QueueManager<D, U> extends SFManager<
	Config,
	SQSEvent,
	D,
	U
> {
	protected getData(event: SQSEvent) {
		switch (this.config.from) {
			case "QUEUE":
				return this.getSqsMessage(event);
			case "TOPIC":
				return this.getSnsMessage(event);
			default:
				throw new Error("Invalid `from` (QueueManager)");
		}
	}

	protected getSqsMessage(event?: SQSEvent) {
		if (!event) return undefined as unknown as D;

		const parsedJson = JSON.parse(event.Records[0].body);

		return parsedJson as D;
	}

	protected getSnsMessage(event?: SQSEvent) {
		if (!event) return undefined as unknown as D;

		const parsedJson = JSON.parse(event.Records[0].body) as SNSMessage;

		return JSON.parse(parsedJson.Message) as D;
	}
}
