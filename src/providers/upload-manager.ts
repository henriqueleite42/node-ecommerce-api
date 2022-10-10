import type { MediaTypeEnum } from "../types/enums/media-type";

export interface UploadFromUrlInput {
	folder: string;
	id: Record<string, any>;
	fileName: string;
	mediaUrl: string;
	mediaType: MediaTypeEnum;
}

export interface FileUploadedMsg {
	filePath: string;
	id: Record<string, any>;
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

export interface UploadManager {
	uploadFromUrlBackground: (p: UploadFromUrlInput) => Promise<void>;

	uploadFromUrl: (p: UploadFromUrlInput) => Promise<void>;

	getUrlToUpload: (p: GetUrlToUploadInput) => Promise<GetUrlToUploadOutput>;
}
