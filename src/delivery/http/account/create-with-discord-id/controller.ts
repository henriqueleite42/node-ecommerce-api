import type { APIGatewayEvent } from "aws-lambda";
import { AccountService } from "factories/account";
import { makeController } from "helpers/make-controller";

import { validate } from "./validate";

import { StatusCodeEnum } from "types/enums/status-code";

export const controller = makeController<APIGatewayEvent>(
	async ({ event }) => {
		try {
			const params = await validate((event.body || {}) as any);

			const service = new AccountService().getInstance();

			const account = await service.createWithDiscordId(params);

			return {
				statusCode: StatusCodeEnum.CREATED,
				body: JSON.stringify(account),
			};
		} catch (err: any) {
			switch (err.message) {
				case "DUPLICATED_DISCORDID":
					return {
						statusCode: StatusCodeEnum.CONFLICT,
						body: JSON.stringify({
							message: "An account with the same discordId already exists",
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
