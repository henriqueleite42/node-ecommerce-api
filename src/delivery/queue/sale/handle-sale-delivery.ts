/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { SaleService } from "../../../factories/sale";
import type { SalePaidMessage, SaleUseCase } from "../../../models/sale";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<SalePaidMessage, SaleUseCase>({
	from: "TOPIC",
	queue: "HandleSaleDelivery",
}).setService(new SaleService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await Promise.allSettled(data.map(service.handleSaleDelivery));
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const handleSaleDelivery = sqsManager.getHandler(__dirname, __filename);
