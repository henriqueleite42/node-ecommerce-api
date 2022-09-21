/* eslint-disable @typescript-eslint/no-magic-numbers */

import { makeValidate } from "utils/validate";
import { yup } from "utils/yup";

const schema = yup
	.object()
	.strict()
	.shape({
		clientId: yup.string().strict().required().uuid(),
		limit: yup.number().required().min(1).max(100),
		continueFrom: yup
			.string()
			.strict()
			.required()
			.matches(/^{.*}$/),
	});

export const validate = makeValidate<{
	clientId: string;
	limit: number;
	continueFrom: string;
}>(schema);
