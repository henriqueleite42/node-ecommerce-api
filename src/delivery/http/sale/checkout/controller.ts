import type { APIGatewayEvent } from "aws-lambda";
import { SaleService } from "factories/sale";
import { makeController } from "helpers/make-controller";

import { validate } from "./validate";

import { StatusCodeEnum } from "types/enums/status-code";

export const controller = makeController<APIGatewayEvent>(
	async ({ event }) => {
		try {
			const params = await validate((event.body || {}) as any);

			const service = new SaleService().getInstance();

			const result = await service.checkout(params);

			return {
				statusCode: StatusCodeEnum.SUCCESS,
				body: JSON.stringify(result),
			};
		} catch (err: any) {
			switch (err.message) {
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
