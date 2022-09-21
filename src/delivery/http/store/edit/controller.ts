import type { APIGatewayEvent } from "aws-lambda";
import { StoreService } from "factories/store";
import { makeController } from "helpers/make-controller";

import { validate } from "./validate";

import { StatusCodeEnum } from "types/enums/status-code";

export const controller = makeController<APIGatewayEvent>(
	async ({ event }) => {
		const params = await validate((event.body || {}) as any);

		const service = new StoreService().getInstance();

		const store = await service.edit(params);

		return {
			statusCode: StatusCodeEnum.CREATED,
			body: JSON.stringify(store),
		};
	},
	{
		isPublic: true,
	},
);
