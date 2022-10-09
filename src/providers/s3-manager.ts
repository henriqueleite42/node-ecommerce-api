import type { S3Event } from "aws-lambda";

import { SFManager } from "./sf-manager";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Config {}

interface SetFuncInput<D, U> {
	data: D;
	service: U;
}

export type SetFunc<D, U> = (p: SetFuncInput<D, U>) => Promise<void> | void;

export interface EventData {
	key: string;
	size: number;
	eTag: string;
	versionId?: string | undefined;
	sequencer: string;
}

export abstract class S3Manager<U> extends SFManager<
	Config,
	S3Event,
	EventData,
	U
> {
	protected getData(event: S3Event): EventData {
		return event.Records[0].s3.object;
	}
}
