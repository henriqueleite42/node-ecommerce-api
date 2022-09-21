import type { APIGatewayEvent } from "aws-lambda";
import { SaleService } from "factories/sale";
import { makeController } from "helpers/make-controller";

import { validate } from "./validate";

import { SalesStatusEnum } from "types/enums/sale-status";
import { StatusCodeEnum } from "types/enums/status-code";

export const controller = makeController<APIGatewayEvent>(
	async ({ event }) => {
		try {
			const { clientId, limit, continueFrom } = await validate(
				(event.queryStringParameters || {}) as any,
			);

			const service = new SaleService().getInstance();

			const sale = await service.getByClientIdStatus({
				clientId,
				status: SalesStatusEnum.IN_CART,
				limit,
				continueFrom,
			});

			return {
				statusCode: StatusCodeEnum.SUCCESS,
				body: JSON.stringify(sale),
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
