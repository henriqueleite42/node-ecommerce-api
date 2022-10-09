import type { ReadStream } from "fs";

import type { MediaTypeEnum } from "../types/enums/media-type";

export interface SaveFileInput {
	folder: string;
	file: ReadStream;
	fileName: string;
	metadata?: Record<string, string>;
}

export interface SaveFileOutput {
	filePath: string;
}

export interface GetUrlToUploadInput {
	folder: string;
	type: MediaTypeEnum;
	fileName: string;
}

export interface GetUrlToUploadOutput {
	url: string;
	headers: Record<string, string>;
}

export interface FileManager {
	saveFile: (p: SaveFileInput) => Promise<SaveFileOutput>;

	getUrlToUpload: (p: GetUrlToUploadInput) => Promise<GetUrlToUploadOutput>;
}
