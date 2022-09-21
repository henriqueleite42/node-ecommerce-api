/* eslint-disable @typescript-eslint/no-magic-numbers */

import type { AddProductSaleInput } from "models/sale";
import { makeValidate } from "utils/validate";
import { yup } from "utils/yup";

const schema = yup
	.object()
	.strict()
	.shape({
		saleId: yup.string().strict().required().uuid(),
		product: yup
			.object()
			.strict()
			.required()
			.shape({
				productId: yup
					.string()
					.strict()
					.required()
					.matches(/^a-z0-9{6}$/i),
				variationId: yup
					.string()
					.strict()
					.notRequired()
					.matches(/^a-z0-9{6}$/i),
			}),
	});

export const validate = makeValidate<AddProductSaleInput>(schema);
