/* eslint-disable @typescript-eslint/no-magic-numbers */

import { getArrayUniqueValues } from "@techmmunity/utils";
import type { EditInput } from "models/product";
import { CustomError } from "utils/error";
import { makeValidate } from "utils/validate";
import { yup } from "utils/yup";

import { StatusCodeEnum } from "types/enums/status-code";

const schema = yup
	.object()
	.strict()
	.shape({
		productId: yup
			.string()
			.strict()
			.required()
			.matches(/^a-z0-9{6}$/i),
		storeId: yup.string().strict().required().uuid(),
		name: yup.string().strict().required().max(100),
		description: yup.string().strict().required().min(1).max(1000),
		color: yup
			.string()
			.strict()
			.notRequired()
			.matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
		price: yup.number().strict().required().min(5),
		imageUrl: yup.string().strict().notRequired().url(),
		variations: yup
			.array()
			.strict()
			.notRequired()
			.min(1)
			.max(5)
			.of(
				yup
					.object()
					.strict()
					.required()
					.shape({
						id: yup
							.string()
							.strict()
							.required()
							.matches(/^a-z0-9{6}$/i),
						name: yup.string().strict().required().max(50),
						description: yup.string().strict().required().min(1).max(500),
						price: yup.number().strict().required().min(5),
					}),
			),
	});

const validatePrice = (price: number) => {
	const priceText = price.toFixed(2);

	const nbrFloat = parseFloat(priceText);

	// Validates if the number has more than 2 decimal
	if (isNaN(nbrFloat) || nbrFloat !== price) {
		throw new CustomError("INVALID_PRODUCT_PRICE", StatusCodeEnum.BAD_REQUEST);
	}
};

export const validate = async (p: EditInput) => {
	const initialValidate = makeValidate<EditInput>(schema);

	const result = await initialValidate(p);

	const { variations, price } = result;

	if (variations) {
		const variationsUniqueNames = getArrayUniqueValues(
			variations.map(v => v.name),
		);

		if (variationsUniqueNames.length !== variations.length) {
			throw new CustomError(
				"DUPLICATED_VARIATIONS",
				StatusCodeEnum.BAD_REQUEST,
			);
		}
	}

	if ((variations?.length || 0) > 0 && price) {
		throw new CustomError("INVALID_PRODUCT_PRICE", StatusCodeEnum.BAD_REQUEST);
	}

	if (price) {
		validatePrice(price);
	}

	if (variations) {
		variations.forEach(v => {
			validatePrice(v.price);
		});
	}

	return result;
};
