/* eslint-disable @typescript-eslint/no-magic-numbers */

import type { CreateSaleInput } from "models/sale";
import { makeValidate } from "utils/validate";
import { yup } from "utils/yup";

const schema = yup
	.object()
	.strict()
	.shape({
		storeId: yup.string().strict().required().uuid(),
		clientId: yup.string().strict().required().uuid(),
		products: yup
			.array()
			.strict()
			.required()
			.of(
				yup
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
							.required()
							.matches(/^a-z0-9{6}$/i),
					}),
			),
	});

export const validate = makeValidate<CreateSaleInput>(schema);
