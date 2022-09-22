/* eslint-disable @typescript-eslint/no-magic-numbers */

import type { AdminWithdrawalInput } from "models/wallet";
import { makeValidate } from "utils/validate";
import { yup } from "utils/yup";

const schema = yup
	.object()
	.strict()
	.shape({
		adminId: yup.string().strict().required().uuid(),
		accountId: yup.string().strict().required().uuid(),
		amount: yup.number().strict().required().min(5).max(10000),
	});

export const validate = makeValidate<AdminWithdrawalInput>(schema);
