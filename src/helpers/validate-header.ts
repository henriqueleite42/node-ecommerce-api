/* eslint-disable @typescript-eslint/no-magic-numbers */

import type { APIGatewayProxyEventHeaders } from "aws-lambda";
import { verify } from "jsonwebtoken";
import { CustomError } from "utils/error";

import { StatusCodeEnum } from "types/enums/status-code";

const verifyToken = (token: string) => {
	const jwtArray = token.split(".");

	if (jwtArray.filter(Boolean).length !== 3) {
		throw new CustomError("Invalid token", StatusCodeEnum.FORBIDDEN);
	}

	try {
		verify(token, process.env.JWT_SECRET, {
			algorithms: ["HS256"],
			issuer: "sellingrockets.com.br",
			maxAge: 600, // 10 minutes
		});
	} catch (err: any) {
		throw new CustomError(
			`Invalid token: ${err.message}`,
			StatusCodeEnum.FORBIDDEN,
		);
	}
};

export const validateHeaders = (headers: APIGatewayProxyEventHeaders) => {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const { Authorization, authorization } = headers;

	const bearerToken = Authorization || authorization;

	if (!bearerToken) {
		throw new CustomError(
			"Authorization is a required header",
			StatusCodeEnum.FORBIDDEN,
		);
	}

	if (!bearerToken.startsWith("Bearer ")) {
		throw new CustomError("Invalid token pattern", StatusCodeEnum.FORBIDDEN);
	}

	const token = bearerToken.replace("Bearer ", "");

	verifyToken(token);
};
