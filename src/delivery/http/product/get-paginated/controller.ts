import type { APIGatewayEvent } from "aws-lambda";
import { ProductService } from "factories/product";
import { makeController } from "helpers/make-controller";

import { validate } from "./validate";

import { StatusCodeEnum } from "types/enums/status-code";

export const controller = makeController<APIGatewayEvent>(
	async ({ event }) => {
		try {
			const params = await validate((event.queryStringParameters || {}) as any);

			const service = new ProductService().getInstance();

			const products = await service.getProductsByType(params);

			return {
				statusCode: StatusCodeEnum.SUCCESS,
				body: JSON.stringify(products),
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
