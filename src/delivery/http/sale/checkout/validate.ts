/* eslint-disable @typescript-eslint/no-magic-numbers */

import { getEnumValues } from "@techmmunity/utils";
import type { CheckoutSaleInput } from "models/sale";
import { makeValidate } from "utils/validate";
import { yup } from "utils/yup";

import { PaymentMethodEnum } from "types/enums/payment-method";

const schema = yup
	.object()
	.strict()
	.shape({
		saleId: yup.string().strict().required().uuid(),
		paymentMethod: yup
			.string()
			.strict()
			.required()
			.oneOf(getEnumValues(PaymentMethodEnum)),
	});

export const validate = makeValidate<CheckoutSaleInput>(schema);
