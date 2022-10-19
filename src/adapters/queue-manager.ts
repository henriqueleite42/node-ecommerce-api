export interface SendMsgInput<T> {
	to: string;
	message: T;
	metadata?: Record<string, number | string>;
	delayInSeconds?: number;
}

export interface QueueManager {
	sendMsg: <T>(p: SendMsgInput<T>) => Promise<void>;
}
