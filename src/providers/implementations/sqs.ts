/* eslint-disable @typescript-eslint/no-magic-numbers */

import type { SNSMessage, SQSEvent } from "aws-lambda";

import type { SetFunc } from "../../providers/queue-manager";
import { QueueManager } from "../../providers/queue-manager";

export class SQSProvider<D, U> extends QueueManager<D, U> {
	public setFunc(func: SetFunc<D, U>) {
		this.func = async ({ event }) => {
			try {
				const data = this.getSnsMessage(event);

				const serviceInstance = this.service?.getInstance();

				await func({
					data,
					service: serviceInstance,
				});
			} catch (err: any) {
				//
			}
		};

		return this;
	}

	public getHandler(dirName: string, fileName: string) {
		return {
			handler: this.getHandlerPath(dirName, fileName),
			events: [
				{
					sqs: {
						arn: {
							// eslint-disable-next-line @typescript-eslint/naming-convention
							Ref: `${this.config.queue}Queue`,
						},
					},
				},
			],
		};
	}

	protected getData(event: SQSEvent) {
		switch (this.config.from) {
			case "QUEUE":
				return this.getSqsMessage(event);
			case "TOPIC":
				return this.getSnsMessage(event);
			default:
				throw new Error("Invalid `from` (SQSProvider)");
		}
	}

	protected getSqsMessage(event?: SQSEvent) {
		if (!event) return undefined as unknown as D;

		const parsedJson = JSON.parse(event.Records[0].body);

		return JSON.parse(parsedJson) as D;
	}

	protected getSnsMessage(event?: SQSEvent) {
		if (!event) return undefined as unknown as D;

		const parsedJson = JSON.parse(event.Records[0].body) as SNSMessage;

		return JSON.parse(parsedJson.Message) as D;
	}
}
