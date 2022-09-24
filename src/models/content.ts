import type { MediaTypeEnum } from "types/enums/media-type";

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

export interface ContentRepository {
	createMany: (p: CreateManyWithUrlInput) => Promise<Array<ContentEntity>>;

	edit: (p: EditInput) => Promise<ContentEntity | null>;
}

/**
 *
 *
 * Usecase
 *
 *
 */

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

	edit: (p: EditInput) => Promise<ContentEntity | null>;
}
