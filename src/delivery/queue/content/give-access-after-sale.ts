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
	from: "TOPIC",
	queue: "GiveAccessAfterSale",
}).setService(new ContentService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(({ service, data }) => {
		return service.giveAccessAfterSale(data);
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const giveAccessAfterSale = sqsManager.getHandler(__dirname, __filename);
