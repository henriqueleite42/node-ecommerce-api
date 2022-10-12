/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { ProductService } from "../../../factories/product";
import type { ProductUseCase } from "../../../models/product";
import { S3Provider } from "../../../providers/implementations/s3";

const s3Manager = new S3Provider<ProductUseCase>({}).setService(
	new ProductService(),
);

/**
 *
 * Func
 *
 */

export const func = s3Manager
	.setFunc(async ({ service, data }) => {
		const [productId, storeId] = data.key.split("/").reverse();

		await service.updateImg({
			storeId,
			productId,
			imageUrl: data.key,
		});
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const updateImg = s3Manager.getHandler(__dirname, __filename);
