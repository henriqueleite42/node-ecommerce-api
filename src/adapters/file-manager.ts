import type { ReadStream } from "fs";

export interface SaveFileInput {
	folder: string;
	file: ReadStream;
	name: string;
	metadata?: Record<string, string>;
}

export interface SaveFileOutput {
	fileUrl: string;
}

export interface FileManager {
	saveFile: (p: SaveFileInput) => Promise<SaveFileOutput>;
}
