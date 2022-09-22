/* eslint-disable @typescript-eslint/no-magic-numbers */

import { isBrazilianPhone, isCnpj, isCpf, isEmail } from "@techmmunity/utils";
import type { AddWWMPixInput } from "models/wallet";
import { makeValidate } from "utils/validate";
import { yup } from "utils/yup";

const schema = yup.object().strict().shape({
	accountId: yup.string().strict().required().uuid(),
	pixKey: yup.string().strict().required(),
});

export const validate = async (p: AddWWMPixInput) => {
	const initialValidate = makeValidate<AddWWMPixInput>(schema);

	const result = await initialValidate(p);

	const { pixKey } = result;

	if (
		!isCpf(pixKey) &&
		!isCnpj(pixKey) &&
		!isEmail(pixKey) &&
		!isBrazilianPhone(pixKey)
	) {
		throw new Error("INVALID_PIX_KEY");
	}

	return result;
};
