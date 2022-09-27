import type { MediaTypeEnum } from "../types/enums/media-type";

export interface UploadFromUrlInput {
	folder: string;
	id: Record<string, any>;
	fileName: string;
	mediaUrl: string;
	mediaType: MediaTypeEnum;
	queueToNotify: string;
}

export interface FileUploadedMsg {
	filePath: string;
	id: Record<string, any>;
}

export interface UploadManager {
	uploadFromUrlBackground: (p: UploadFromUrlInput) => Promise<void>;

	uploadFromUrl: (p: UploadFromUrlInput) => Promise<void>;
}
