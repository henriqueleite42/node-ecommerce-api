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

			const sale = await service.create(params);

			return {
				statusCode: StatusCodeEnum.CREATED,
				body: JSON.stringify(sale),
			};
		} catch (err: any) {
			switch (err.message) {
				case "PRODUCT_NOT_FOUND":
					return {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						body: JSON.stringify({
							message: "Product not found",
						}),
					};
				case "INVALID_VARIATION":
					return {
						statusCode: StatusCodeEnum.BAD_REQUEST,
						body: JSON.stringify({
							message: "Invalid variation",
						}),
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
