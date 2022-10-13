/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { WalletService } from "../../../factories/wallet";
import type { SaleEntity } from "../../../models/sale";
import type { WalletUseCase } from "../../../models/wallet";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<SaleEntity, WalletUseCase>({
	from: "TOPIC",
	queue: "DecreasePendingBalance",
}).setService(new WalletService());

/**
 *
 * Func
 *
 */

export const func = sqsManager
	.setFunc(async ({ service, data }) => {
		await service.incrementPendingBalance({
			accountId: data.storeId,
			amount: -data.finalValue!,
		});
	})
	.getFunc();

/**
 *
 * Handler
 *
 */

export const decreasePendingBalance = sqsManager.getHandler(
	__dirname,
	__filename,
);
