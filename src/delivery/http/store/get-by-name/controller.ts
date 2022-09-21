import type { APIGatewayEvent } from "aws-lambda";
import { StoreService } from "factories/store";
import { makeController } from "helpers/make-controller";

import { validate } from "./validate";

import { StatusCodeEnum } from "types/enums/status-code";

export const controller = makeController<APIGatewayEvent>(
	async ({ event }) => {
		try {
			const params = await validate((event.queryStringParameters || {}) as any);

			const service = new StoreService().getInstance();

			const store = await service.getByName(params);

			return {
				statusCode: StatusCodeEnum.SUCCESS,
				body: JSON.stringify(store),
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
