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

			const product = await service.getById(params);

			return {
				statusCode: StatusCodeEnum.SUCCESS,
				body: JSON.stringify(product),
			};
		} catch (err: any) {
			switch (err.message) {
				case "NOT_FOUND":
					return {
						statusCode: StatusCodeEnum.NOT_FOUND,
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
