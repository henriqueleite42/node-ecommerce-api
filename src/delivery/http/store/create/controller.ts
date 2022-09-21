import type { APIGatewayEvent } from "aws-lambda";
import { StoreService } from "factories/store";
import { makeController } from "helpers/make-controller";

import { validate } from "./validate";

import { StatusCodeEnum } from "types/enums/status-code";

export const controller = makeController<APIGatewayEvent>(
	async ({ event }) => {
		try {
			const params = await validate((event.body || {}) as any);

			const service = new StoreService().getInstance();

			const store = await service.create(params);

			return {
				statusCode: StatusCodeEnum.CREATED,
				body: JSON.stringify(store),
			};
		} catch (err: any) {
			switch (err.message) {
				case "DUPLICATED_NAME":
					return {
						statusCode: StatusCodeEnum.CONFLICT,
						body: JSON.stringify({
							message: "An store with the same name already exists",
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
