/* eslint-disable @typescript-eslint/naming-convention */

import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import type { MessageAttributeValue } from "@aws-sdk/client-sns";

import type { TopicManager, SendMsgInput } from "../../adapters/topic-manager";

export class SNSAdapter implements TopicManager {
	private readonly sns: SNSClient;

	public constructor() {
		const { NODE_ENV } = process.env;

		if (NODE_ENV === "local") {
			this.sns = {
				send: () => {},
			} as unknown as SNSClient;
		} else {
			this.sns = new SNSClient({});
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

		await this.sns.send(
			new PublishCommand({
				TopicArn: "",
				Message: JSON.stringify(p),
				MessageAttributes: p.metadata ? metadata : undefined,
			}),
		);
	}
}
