import type { StatusCodeEnum } from "../types/enums/status-code";

export class CustomError extends Error {
	protected body: {
		message: string;
	};

	public constructor(body: string, public statusCode: StatusCodeEnum) {
		super("Error");

		this.body = {
			message: body,
		};
	}

	public getBody() {
		return JSON.stringify(this.body);
	}
}
