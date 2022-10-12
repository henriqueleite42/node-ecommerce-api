import type { GetFileOutput } from "../adapters/file-manager";
import type { GetUrlToUploadOutput } from "../providers/upload-manager";

import type { MediaTypeEnum } from "../types/enums/media-type";

export interface ContentEntity {
	contentId: string;
	storeId: string;
	productId: string;
	type: MediaTypeEnum;
	rawContentPath?: string;
	processedContentPath?: string;
	createdAt: Date;
}

/**
 *
 *
 * Repository
 *
 *
 */

export interface CreateManyInput
	extends Pick<ContentEntity, "productId" | "storeId"> {
	contents: Array<{
		type: MediaTypeEnum;
	}>;
}

export type EditInput = Partial<Omit<ContentEntity, "createdAt" | "type">> &
	Pick<ContentEntity, "contentId" | "productId" | "storeId">;

export interface GetContentInput {
	storeId: string;
	productId: string;
	contentId: string;
}

export interface ContentRepository {
	createMany: (p: CreateManyWithUrlInput) => Promise<Array<ContentEntity>>;

	edit: (p: EditInput) => Promise<ContentEntity | null>;

	getContent: (p: GetContentInput) => Promise<ContentEntity | null>;
}

/**
 *
 *
 * Usecase
 *
 *
 */

export interface GetContentFileInput {
	accountId: string;
	storeId: string;
	productId: string;
	contentId: string;
}

export interface GetUrlToUploadRawImgInput {
	storeId: string;
	productId: string;
	contentId: string;
	type: MediaTypeEnum;
}

export interface CreateManyWithUrlInput
	extends Pick<ContentEntity, "productId" | "storeId"> {
	contents: Array<{
		type: MediaTypeEnum;
		mediaUrl: string;
	}>;
}

export interface ContentUseCase {
	createManyWithUrl: (
		p: CreateManyWithUrlInput,
	) => Promise<Array<ContentEntity>>;

	getUrlToUploadRawImg: (
		p: GetUrlToUploadRawImgInput,
	) => Promise<GetUrlToUploadOutput>;

	getContentFile: (p: GetContentFileInput) => Promise<GetFileOutput>;

	edit: (p: EditInput) => Promise<ContentEntity | null>;
}
