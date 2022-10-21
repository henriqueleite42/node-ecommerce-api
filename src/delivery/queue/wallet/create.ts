/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { WalletService } from "../../../factories/wallet";
import type { StoreEntity } from "../../../models/store";
import type { WalletUseCase } from "../../../models/wallet";
import { SQSProvider } from "../../../providers/implementations/sqs";

const sqsManager = new SQSProvider<StoreEntity, WalletUseCase>({
	from: "TOPIC",
	queue: "CreateWallet",
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
				service.create({
					accountId: d.accountId,
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

export const create = sqsManager.getHandler(__dirname, __filename);
