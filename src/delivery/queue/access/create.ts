/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { AccessService } from "factories/access";
import type { AccessUseCase } from "models/access";
import type { SaleEntity } from "models/sale";
import { SQSProvider } from "providers/implementations/sqs";

const sqsManager = new SQSProvider<SaleEntity, AccessUseCase>({
	from: "TOPIC",
	domain: "access",
	queue: "CreateAccess",
}).setService(new AccessService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await service.createMany({
			accountId: data.clientId,
			accesses: data.products.map(p => ({
				storeId: data.storeId,
				productId: p.productId,
				variationId: p.variationId,
			})),
		});
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const create = sqsManager.getHandler(__dirname, __filename);
