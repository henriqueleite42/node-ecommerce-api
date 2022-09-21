import type { MediaTypeEnum } from "types/enums/media-type";

export interface UploadFromUrlInput {
	type: "CONTENT" | "PRODUCT" | "STORE_AVATAR" | "STORE_BANNER";
	id: Record<string, any>;
	mediaUrl: string;
	mediaType: MediaTypeEnum;
	queueToNotify: string;
}

export interface FileUploadedMsg {
	fileUrl: string;
	id: Record<string, any>;
}

export interface UploadManager {
	uploadFromUrlBackground: (p: UploadFromUrlInput) => Promise<void>;

	uploadFromUrl: (p: UploadFromUrlInput) => Promise<void>;
}
