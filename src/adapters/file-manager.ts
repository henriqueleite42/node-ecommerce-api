import type { ReadStream } from "fs";

export interface SaveFileInput {
	folder: string;
	file: ReadStream;
	name: string;
	metadata?: Record<string, string>;
}

export interface SaveFileOutput {
	filePath: string;
}

export interface FileManager {
	saveFile: (p: SaveFileInput) => Promise<SaveFileOutput>;
}
