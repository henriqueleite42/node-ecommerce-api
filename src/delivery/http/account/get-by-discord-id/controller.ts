import type { APIGatewayEvent } from "aws-lambda";
import { AccountService } from "factories/account";
import { makeController } from "helpers/make-controller";

import { validate } from "./validate";

import { StatusCodeEnum } from "types/enums/status-code";

export const controller = makeController<APIGatewayEvent>(
	async ({ event }) => {
		try {
			const { discordId } = await validate({
				...(event.queryStringParameters || {}),
				...(event.pathParameters || {}),
			} as any);

			const service = new AccountService().getInstance();

			const account = await service.getByDiscordId(discordId);

			return {
				statusCode: StatusCodeEnum.SUCCESS,
				body: JSON.stringify(account),
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
