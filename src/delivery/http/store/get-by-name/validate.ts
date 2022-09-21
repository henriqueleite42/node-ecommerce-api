/* eslint-disable @typescript-eslint/no-magic-numbers */

import type { GetByNameInput } from "models/store";
import { makeValidate } from "utils/validate";
import { yup } from "utils/yup";

const schema = yup
	.object()
	.strict()
	.shape({
		name: yup
			.string()
			.strict()
			.required()
			.matches(/^[a-z0-9-]{1,16}$/),
	});

export const validate = makeValidate<GetByNameInput>(schema);
