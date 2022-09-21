import type { SNSMessage, SQSEvent } from "aws-lambda";

export const getSqsSnsMessage = <T = any>(event: SQSEvent) => {
	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	const parsedJson = JSON.parse(event.Records[0].body) as SNSMessage;

	return JSON.parse(parsedJson.Message) as T;
};
