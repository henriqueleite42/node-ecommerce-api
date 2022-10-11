/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { ContentService } from "../../../factories/content";
import type { ContentUseCase } from "../../../models/content";
import { S3Provider } from "../../../providers/implementations/s3";

const s3Manager = new S3Provider<ContentUseCase>({}).setService(
	new ContentService(),
);

/**
 *
 * Func
 *
 */

export const func = s3Manager
	.setFunc(async ({ service, data }) => {
		const [contentId, productId, storeId] = data.key.split("/").reverse();

		await service.edit({
			storeId,
			productId,
			contentId,
			rawContentPath: data.key,
			processedContentPath: data.key,
		});
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const updateRawImg = s3Manager.getHandler(__dirname, __filename);
