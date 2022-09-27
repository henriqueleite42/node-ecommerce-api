/* eslint-disable @typescript-eslint/no-magic-numbers */

import type { AuthManager } from "../../providers/auth-manager";
import { HttpManager } from "../../providers/http-manager";

import { CustomError } from "../../utils/error";

import { StatusCodeEnum } from "../../types/enums/status-code";

export class LambdaProvider<U, I> extends HttpManager<U, I> {
	public setAuth(authManager: AuthManager) {
		this.authManager = authManager;

		return this;
	}

	public setFunc(func: keyof U) {
		this.func = async event => {
			try {
				const authHeader = this.getAuthHeader(event.headers);

				if (this.authManager) {
					this.authManager.isAuthorized(authHeader);
				}

				const params = {
					body: event.body ? JSON.parse(event.body) : undefined,
					query: event.queryStringParameters,
					headers: event.headers,
					path: event.pathParameters,
					auth: this.authManager.getAuthData(authHeader),
				};

				const validatedData = await this.validationManager.validate(params);

				const serviceInstance = this.service.getInstance();

				const result = await (serviceInstance[func] as any)(validatedData);

				return {
					statusCode: this.getStatusCode(),
					body: result ? JSON.stringify(result) : undefined,
				};
			} catch (err: any) {
				if (err instanceof CustomError) {
					return {
						statusCode: err.statusCode,
						body: err.getBody(),
					};
				}

				switch (err.message) {
					case "NOT_ENOUGH_FUNDS":
						return {
							statusCode: StatusCodeEnum.NOT_ACCEPTABLE,
						};
					case "NOT_FOUND":
						return {
							statusCode: StatusCodeEnum.NOT_FOUND,
						};
					case "DUPLICATED_NAME":
						return {
							statusCode: StatusCodeEnum.CONFLICT,
							body: JSON.stringify({
								message: "An store with the same name already exists",
							}),
						};
					case "DUPLICATED_DISCORD_ID":
						return {
							statusCode: StatusCodeEnum.CONFLICT,
							body: JSON.stringify({
								message: "An account with the same discordId already exists",
							}),
						};
					case "SALE_NOT_FOUND":
						return {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							body: JSON.stringify({
								message: "Sale not found",
							}),
						};
					case "SALE_ALREADY_IN_PROGRESS":
						return {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							body: JSON.stringify({
								message: "Sale already in progress",
							}),
						};
					case "DUPLICATED_PRODUCT":
						return {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							body: JSON.stringify({
								message: "Duplicated product",
							}),
						};
					case "PRODUCT_NOT_FOUND":
						return {
							statusCode: StatusCodeEnum.BAD_REQUEST,
							body: JSON.stringify({
								message: "Product not found",
							}),
						};
					default:
						console.error(err);

						return {
							statusCode: StatusCodeEnum.INTERNAL,
						};
				}
			}
		};

		return this;
	}

	public getHandler(dirName: string, fileName: string) {
		return {
			handler: this.getHandlerPath(dirName, fileName),
			events: [
				{
					http: {
						cors: true,
						method: this.config.method,
						path: this.config.path,
					},
				},
			],
		};
	}

	public getFunc() {
		return this.func;
	}

	// Private methods

	private getStatusCode() {
		if (this.config.statusCode) return this.config.statusCode;

		switch (this.config.method) {
			case "DELETE":
				return StatusCodeEnum.NO_CONTENT;
			default:
				return StatusCodeEnum.SUCCESS;
		}
	}
}
