import { QueueManager } from "../../providers/queue-manager";

export class SQSProvider<D, U> extends QueueManager<D, U> {
	public getHandler(dirName: string, fileName: string) {
		return {
			handler: this.getHandlerPath(dirName, fileName),
			events: [
				{
					sqs: {
						arn: {
							// eslint-disable-next-line @typescript-eslint/naming-convention
							"Fn::GetAtt": [`${this.config.queue}Queue`, "Arn"],
						},
					},
				},
			],
		};
	}
}
