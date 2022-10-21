/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { WalletService } from "../../../factories/wallet";
import type { SaleDeliveryConfirmedMessage } from "../../../models/sale";
import type { WalletUseCase } from "../../../models/wallet";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<SaleDeliveryConfirmedMessage, WalletUseCase>(
	{
		from: "TOPIC",
		queue: "ReleasePendingBalance",
	},
).setService(new WalletService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await Promise.allSettled(
			data.map(d =>
				service.releasePendingBalance({
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

export const releasePendingBalance = sqsManager.getHandler(
	__dirname,
	__filename,
);
