/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { AccessService } from "../../../factories/access";
import type { AccessUseCase } from "../../../models/access";
import type { SalePaidMessage } from "../../../models/sale";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<SalePaidMessage, AccessUseCase>({
	from: "TOPIC",
	queue: "GiveAccessAfterSale",
}).setService(new AccessService());

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
