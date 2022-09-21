import type { ObjectSchema } from "yup";

import { CustomError } from "./error";

import { StatusCodeEnum } from "types/enums/status-code";

export const makeValidate =
	<ServiceParams>(schema: ObjectSchema<any>) =>
	(params: ServiceParams) =>
		schema.validate(params).catch(err => {
			throw new CustomError(err.errors.join(";"), StatusCodeEnum.BAD_REQUEST);
		}) as Promise<ServiceParams>;
