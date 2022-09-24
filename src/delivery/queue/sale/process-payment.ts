/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { SaleService } from "factories/sale";
import type { ProcessPaymentSaleInput, SaleUseCase } from "models/sale";
import { SQSProvider } from "providers/implementations/sqs";

const sqsManager = new SQSProvider<ProcessPaymentSaleInput, SaleUseCase>({
	from: "TOPIC",
	domain: "sale",
	queue: "ProcessPayment",
}).setService(new SaleService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await service.processPayment({ saleId: data.saleId });
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const processPayment = sqsManager.getHandler(__dirname, __filename);
