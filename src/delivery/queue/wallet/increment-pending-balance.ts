/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { WalletService } from "../../../factories/wallet";
import type { SalePaidMessage } from "../../../models/sale";
import type { WalletUseCase } from "../../../models/wallet";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<SalePaidMessage, WalletUseCase>({
	from: "TOPIC",
	queue: "IncrementPendingBalance",
}).setService(new WalletService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await Promise.allSettled(
			data.map(d =>
				service.incrementPendingBalance({
					accountId: d.storeId,
					amount: d.finalValue,
				}),
			),
		);
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const incrementPendingBalance = sqsManager.getHandler(
	__dirname,
	__filename,
);
