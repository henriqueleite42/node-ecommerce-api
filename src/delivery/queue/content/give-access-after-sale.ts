/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { ContentService } from "../../../factories/content";
import type { ContentUseCase } from "../../../models/content";
import type { SalePaidMessage } from "../../../models/sale";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<SalePaidMessage, ContentUseCase>({
	from: "QUEUE",
	queue: "GiveBuyerAccessToPreMadeAutomaticSaleProducts",
}).setService(new ContentService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await Promise.allSettled(data.map(service.giveAccessAfterSale));
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const giveAccessAfterSale = sqsManager.getHandler(__dirname, __filename);
