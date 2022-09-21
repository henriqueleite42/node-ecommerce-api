/* eslint-disable @typescript-eslint/no-magic-numbers */

import { getEnumValues } from "@techmmunity/utils";
import type { GetProductsByTypeInput } from "models/product";
import { makeValidate } from "utils/validate";
import { yup } from "utils/yup";

import { ProductTypeEnum } from "types/enums/product-type";

const schema = yup
	.object()
	.strict()
	.shape({
		storeId: yup.string().strict().required().uuid(),
		type: yup
			.string()
			.strict()
			.required()
			.oneOf(getEnumValues(ProductTypeEnum)),
		limit: yup.number().required().min(1).max(100),
		continueFrom: yup
			.string()
			.strict()
			.required()
			.matches(/^{.*}$/),
	});

export const validate = makeValidate<GetProductsByTypeInput>(schema);
