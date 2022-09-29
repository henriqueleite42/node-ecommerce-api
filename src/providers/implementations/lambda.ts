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

				const validatedData = await this.validationManager?.validate(params);

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
						body: err.getBodyString(),
					};
				}

				console.error(err);

				return {
					statusCode: StatusCodeEnum.INTERNAL,
				};
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
