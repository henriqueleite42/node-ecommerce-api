/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { StoreService } from "../../../factories/store";
import type { StoreUseCase } from "../../../models/store";
import { S3Provider } from "../../../providers/implementations/s3";

const s3Manager = new S3Provider<StoreUseCase>({}).setService(
	new StoreService(),
);

/**
 *
 * Func
 *
 */

export const func = s3Manager
	.setFunc(async ({ service, data }) => {
		const storeId = data.key.split("/").pop()!;

		await service.updateAvatarUrl({
			storeId,
			avatarUrl: data.key,
		});
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const updateAvatar = s3Manager.getHandler(__dirname, __filename);
