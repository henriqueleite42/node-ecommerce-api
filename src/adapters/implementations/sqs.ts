/* eslint-disable @typescript-eslint/naming-convention */

import type { MessageAttributeValue } from "@aws-sdk/client-sns";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

import type { QueueManager, SendMsgInput } from "../../adapters/queue-manager";

export class SQSAdapter implements QueueManager {
	private readonly sqs: SQSClient;

	public constructor() {
		const { NODE_ENV } = process.env;

		if (NODE_ENV === "local") {
			this.sqs = {
				send: () => {},
			} as unknown as SQSClient;
		} else {
			this.sqs = new SQSClient({});
		}
	}

	public async sendMsg(p: SendMsgInput) {
		const metadata: Record<string, MessageAttributeValue> = {};

		if (p.metadata) {
			Object.entries(p.metadata).forEach(([key, value]) => {
				metadata[key] = {
					DataType: typeof value === "string" ? "String" : "Number",
					StringValue: value.toString(),
				};
			});
		}

		await this.sqs.send(
			new SendMessageCommand({
				QueueUrl: p.to,
				MessageBody: JSON.stringify(p.message),
				MessageAttributes: p.metadata ? metadata : undefined,
			}),
		);
	}
}
