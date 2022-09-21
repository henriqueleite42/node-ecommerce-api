/* eslint-disable @typescript-eslint/no-magic-numbers */

import type { GetByIdInput } from "models/product";
import { makeValidate } from "utils/validate";
import { yup } from "utils/yup";

const schema = yup
	.object()
	.strict()
	.shape({
		storeId: yup.string().strict().required().uuid(),
		productId: yup
			.string()
			.strict()
			.required()
			.matches(/^a-z0-9{6}$/i),
	});

export const validate = makeValidate<GetByIdInput>(schema);
