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
	.setFunc(({ service, data }) => {
		return service.handleSaleDelivery(data);
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const handleSaleDelivery = sqsManager.getHandler(__dirname, __filename);
