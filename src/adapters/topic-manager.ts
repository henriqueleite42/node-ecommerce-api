export interface SendMsgInput<T> {
	to: string;
	message: T;
	metadata?: Record<string, number | string>;
	// DelayInSeconds?: number;
}

export interface TopicManager {
	sendMsg: <T>(p: SendMsgInput<T>) => Promise<void>;
}
