/* eslint-disable @typescript-eslint/no-magic-numbers */

import { getEnumValues } from "@techmmunity/utils";
import type { CheckoutSaleInput } from "models/sale";
import { makeValidate } from "utils/validate";
import { yup } from "utils/yup";

import { SalesStatusEnum } from "types/enums/sale-status";

const schema = yup
	.object()
	.strict()
	.shape({
		saleId: yup.string().strict().required().uuid(),
		status: yup
			.string()
			.strict()
			.required()
			.oneOf(getEnumValues(SalesStatusEnum)),
	});

export const validate = makeValidate<CheckoutSaleInput>(schema);
