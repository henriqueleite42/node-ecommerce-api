/* eslint-disable @typescript-eslint/no-magic-numbers */

import type { EditInput } from "models/store";
import { makeValidate } from "utils/validate";
import { yup } from "utils/yup";

const schema = yup
	.object()
	.strict()
	.shape({
		storeId: yup.string().strict().required().uuid(),
		accountId: yup.string().strict().required().uuid(),
		description: yup.string().strict().notRequired().max(1000),
		color: yup
			.string()
			.strict()
			.notRequired()
			.matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
		bannerUrl: yup.string().strict().notRequired().url(),
		avatarUrl: yup.string().strict().notRequired().url(),
	});

export const validate = makeValidate<EditInput>(schema);
