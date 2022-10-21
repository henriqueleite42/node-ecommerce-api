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
	Array<D>,
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
		if (!event) return [];

		return event.Records.map(r => JSON.parse(r.body)) as Array<D>;
	}

	protected getSnsMessage(event?: SQSEvent) {
		if (!event) return [];

		const msgs = event.Records.map<SNSMessage>(r => JSON.parse(r.body));

		return msgs.map<D>(m => JSON.parse(m.Message));
	}
}
