import type { APIGatewayEvent } from "aws-lambda";
import { StoreService } from "factories/store";
import { makeController } from "helpers/make-controller";

import { StatusCodeEnum } from "types/enums/status-code";

export const controller = makeController<APIGatewayEvent>(
	async () => {
		try {
			const service = new StoreService().getInstance();

			const stores = await service.getTop();

			return {
				statusCode: StatusCodeEnum.SUCCESS,
				body: JSON.stringify(stores),
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
