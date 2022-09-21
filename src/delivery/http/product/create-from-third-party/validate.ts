/* eslint-disable @typescript-eslint/no-magic-numbers */

import { getArrayUniqueValues, getEnumValues } from "@techmmunity/utils";
import type { CreateFromThirdPartyInput } from "models/product";
import { CustomError } from "utils/error";
import { makeValidate } from "utils/validate";
import { yup } from "utils/yup";

import {
	DeliveryMethodEnum,
	isAutomaticDelivery,
} from "types/enums/delivery-method";
import { MediaTypeEnum } from "types/enums/media-type";
import { isPreMadeProduct, ProductTypeEnum } from "types/enums/product-type";
import { StatusCodeEnum } from "types/enums/status-code";

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
		deliveryMethod: yup
			.string()
			.strict()
			.required()
			.oneOf(getEnumValues(DeliveryMethodEnum)),
		name: yup.string().strict().required().max(100),
		description: yup.string().strict().required().min(1).max(1000),
		color: yup
			.string()
			.strict()
			.notRequired()
			.matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
		price: yup.number().strict().required().min(5).max(10000),
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
						name: yup.string().strict().required().max(50),
						description: yup.string().strict().required().min(1).max(500),
						price: yup.number().strict().required().min(5),
					}),
			),
		contents: yup
			.array()
			.strict()
			.notRequired()
			.min(1)
			.max(500)
			.of(
				yup
					.object()
					.strict()
					.required()
					.shape({
						type: yup
							.string()
							.strict()
							.required()
							.oneOf(getEnumValues(MediaTypeEnum)),
						mediaUrl: yup.string().strict().required().url(),
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

export const validate = async (p: CreateFromThirdPartyInput) => {
	const initialValidate = makeValidate<CreateFromThirdPartyInput>(schema);

	const result = await initialValidate(p);

	const { variations, contents, price, type, deliveryMethod } = result;

	const variationsUniqueNames = getArrayUniqueValues(
		variations.map(v => v.name),
	);

	if (variationsUniqueNames.length !== variations.length) {
		throw new CustomError("DUPLICATED_VARIATIONS", StatusCodeEnum.BAD_REQUEST);
	}

	const contentsUniqueNames = getArrayUniqueValues(
		contents?.map(c => c.mediaUrl) || [],
	);

	if (contentsUniqueNames.length !== (contents?.length || 0)) {
		throw new CustomError("DUPLICATED_CONTENTS", StatusCodeEnum.BAD_REQUEST);
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

	if (!isPreMadeProduct(type) && isAutomaticDelivery(deliveryMethod)) {
		throw new CustomError(
			"INVALID_DELIVERY_METHOD",
			StatusCodeEnum.BAD_REQUEST,
		);
	}

	return result;
};
