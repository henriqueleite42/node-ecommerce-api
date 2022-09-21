export interface SendMsgInput {
	to: string;
	message: Record<string, any>;
	metadata?: Record<string, number | string>;
	// DelayInSeconds?: number;
}

export interface QueueManager {
	sendMsg: (p: SendMsgInput) => Promise<void>;
}
