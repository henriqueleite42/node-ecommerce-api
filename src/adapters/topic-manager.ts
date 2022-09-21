export interface SendMsgInput {
	to: string;
	message: Record<string, any>;
	metadata?: Record<string, number | string>;
	// DelayInSeconds?: number;
}

export interface TopicManager {
	sendMsg: (p: SendMsgInput) => Promise<void>;
}
