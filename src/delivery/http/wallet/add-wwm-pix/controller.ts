import type { APIGatewayEvent } from "aws-lambda";
import { WalletService } from "factories/wallet";
import { makeController } from "helpers/make-controller";

import { validate } from "./validate";

import { StatusCodeEnum } from "types/enums/status-code";

export const controller = makeController<APIGatewayEvent>(
	async ({ event }) => {
		try {
			const params = await validate((event.body || {}) as any);

			const service = new WalletService().getInstance();

			await service.addWWMPix(params);

			return {
				statusCode: StatusCodeEnum.NO_CONTENT,
			};
		} catch (err: any) {
			switch (err.message) {
				case "WALLET_NOT_FOUND":
					return {
						statusCode: StatusCodeEnum.NOT_FOUND,
					};
				case "DUPLICATED_WWM":
					return {
						statusCode: StatusCodeEnum.CONFLICT,
					};
				default:
					return {
						statusCode: StatusCodeEnum.INTERNAL,
					};
			}
		}
	},
	{
		isPublic: true,
	},
);
