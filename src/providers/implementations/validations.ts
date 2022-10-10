/* eslint-disable @typescript-eslint/no-magic-numbers */

import {
	getArrayUniqueValues,
	getEnumValues,
	isBrazilianPhone,
	isCnpj,
	isCpf,
	isEmail,
	isUrl,
} from "@techmmunity/utils";

import type { Validations as ValidationsType } from "../../providers/validator";

import { ValidatorProvider } from "./validator";

import { CustomError } from "../../utils/error";

import { DeliveryMethodEnum } from "../../types/enums/delivery-method";
import { MediaTypeEnum } from "../../types/enums/media-type";
import { PaymentMethodEnum } from "../../types/enums/payment-method";
import { PlatformEnum } from "../../types/enums/platform";
import { ProductTypeEnum } from "../../types/enums/product-type";
import { StatusCodeEnum } from "../../types/enums/status-code";

export class Validations {
	public static required(key: string, p?: any) {
		if (p === undefined || p === null) {
			throw new CustomError(
				`${key} is a required field`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}
	}

	public static string(key: string, p?: any) {
		if (!p) return p;

		if (typeof p !== "string") {
			throw new CustomError(
				`${key} must be a string`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}
	}

	public static limit(key: string, p?: any) {
		if (!p) return;

		if (p < 1 || p > 100) {
			throw new CustomError(
				`${key} must be between 1 and 100`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}
	}

	public static cursor(key: string, p?: any) {
		if (!p) return;

		if (!/^{.*}$/.test(p)) {
			throw new CustomError(
				`${key} must be a valid json`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		try {
			JSON.parse(p);
		} catch (err: any) {
			throw new CustomError(
				`${key} must be a valid json`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}
	}

	public static minLength(minLength: number) {
		return (key: string, p?: any) => {
			if (!p) return;

			if (p.length < minLength) {
				throw new CustomError(
					`${key} must have a length of at least ${minLength}`,
					StatusCodeEnum.BAD_REQUEST,
				);
			}
		};
	}

	public static maxLength(maxLength: number) {
		return (key: string, p?: any) => {
			if (!p) return;

			if (p.length > maxLength) {
				throw new CustomError(
					`${key} must have a length of at least ${maxLength}`,
					StatusCodeEnum.BAD_REQUEST,
				);
			}
		};
	}

	public static array(key: string, p?: any) {
		if (!p) return;

		if (!Array.isArray(p)) {
			throw new CustomError(
				`${key} must be an array`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}
	}

	public static arrOfObj(vArr: Array<Omit<ValidationsType<any>, "loc">>) {
		return (key: string, p?: any) => {
			if (!p) return;

			if (!Array.isArray(p)) {
				throw new CustomError(
					`${key} must be an array`,
					StatusCodeEnum.BAD_REQUEST,
				);
			}

			const validator = new ValidatorProvider(vArr as any);

			p.forEach((v: any, idx) => {
				try {
					validator.validate(v);
				} catch (err: any) {
					if (err instanceof CustomError) {
						const { message } = JSON.parse(err.getBodyString());

						throw new CustomError(
							`${key}[${idx}].${message}`,
							StatusCodeEnum.BAD_REQUEST,
						);
					} else {
						throw new CustomError(
							`${key}[${idx}].??? ${err.message}`,
							StatusCodeEnum.BAD_REQUEST,
						);
					}
				}
			});
		};
	}

	public static obj(vArr: Array<Omit<ValidationsType<any>, "loc">>) {
		return (key: string, p?: any) => {
			if (!p) return;

			try {
				new ValidatorProvider(vArr as any).validate(p);
			} catch (err: any) {
				if (err instanceof CustomError) {
					const { message } = JSON.parse(err.getBodyString());

					throw new CustomError(
						`${key}.${message}`,
						StatusCodeEnum.BAD_REQUEST,
					);
				} else {
					throw new CustomError(
						`${key}.??? ${err.message}`,
						StatusCodeEnum.BAD_REQUEST,
					);
				}
			}
		};
	}

	public static arrayUnique(prop?: string) {
		return (key: string, p?: any) => {
			if (!p) return;

			const values = prop ? p?.map((v: any) => v?.[prop]) : p;

			if (getArrayUniqueValues(values).length !== p?.length) {
				throw new CustomError(
					prop
						? `${key}.${prop} must have unique values`
						: `${key} must have unique values`,
					StatusCodeEnum.BAD_REQUEST,
				);
			}
		};
	}

	// Third Party

	public static discordId(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new CustomError(
				`${key} must be a string`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		if (!/^\d{18}$/.test(p)) {
			throw new CustomError(
				`${key} must be a string`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}
	}

	// Ids & Tokens

	public static id(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new CustomError(
				`${key} must be a string`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		if (!/^[\w-]{21}$/.test(p)) {
			throw new CustomError(
				`${key} must be a valid id`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}
	}

	public static code(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new CustomError(
				`${key} must be a string`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		if (!/^[a-z0-9]{6}$/i.test(p)) {
			throw new CustomError(
				`${key} must be a valid code`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}
	}

	public static token(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new CustomError(
				`${key} must be a string`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		if (!/^[a-z0-9]{32}$/i.test(p)) {
			throw new CustomError(
				`${key} must be a valid token`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}
	}

	// Business

	public static username(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new CustomError(
				`${key} must be a string`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		if (!/^[a-z0-9-]{1,16}$/i.test(p)) {
			throw new CustomError(
				`${key} must be a valid code`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}
	}

	public static storeDescription(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new CustomError(
				`${key} must be a string`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		Validations.maxLength(500)(key, p);
	}

	public static productName(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new CustomError(
				`${key} must be a string`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		if (p.length < 1 || p.length > 100) {
			throw new CustomError(
				`${key} must have a length between 1 and 100`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}
	}

	public static productDescription(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new CustomError(
				`${key} must be a string`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		if (p.length < 1 || p.length > 1000) {
			throw new CustomError(
				`${key} must have a length between 1 and 100`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}
	}

	public static productPrice(key: string, p?: any) {
		if (typeof p === "undefined") return;

		if (typeof p !== "number") {
			throw new CustomError(
				`${key} must be a number`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		Validations.min(5)(key, p);

		Validations.money(key, p);
	}

	public static variationName(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new CustomError(
				`${key} must be a string`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		if (p.length < 1 || p.length > 50) {
			throw new CustomError(
				`${key} must have a length between 1 and 100`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}
	}

	public static variationDescription(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new CustomError(
				`${key} must be a string`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		if (p.length < 1 || p.length > 500) {
			throw new CustomError(
				`${key} must have a length between 1 and 100`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}
	}

	public static pixKey(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new CustomError(
				`${key} must be a string`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		if (!isCpf(p) && !isCnpj(p) && !isEmail(p) && !isBrazilianPhone(p)) {
			throw new CustomError(
				`${key} must be a valid pix key`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}
	}

	public static couponCode(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new CustomError(
				`${key} must be a string`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		if (!/^[A-Z0-9]{1,20}$/.test(p)) {
			throw new CustomError(
				`${key} must be a valid coupon code`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}
	}

	// Enums

	public static deliveryMethod(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new CustomError(
				`${key} must be a string`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		const values = getEnumValues(DeliveryMethodEnum);

		if (!values.includes(p)) {
			throw new CustomError(
				`${key} must be in: ${values.map(v => `'${v}'`)}`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}
	}

	public static productType(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new CustomError(
				`${key} must be a string`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		const values = getEnumValues(ProductTypeEnum);

		if (!values.includes(p)) {
			throw new CustomError(
				`${key} must be in: ${values.map(v => `'${v}'`)}`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}
	}

	public static mediaType(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new CustomError(
				`${key} must be a string`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		const values = getEnumValues(MediaTypeEnum);

		if (!values.includes(p)) {
			throw new CustomError(
				`${key} must be in: ${values.map(v => `'${v}'`)}`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}
	}

	public static paymentMethod(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new CustomError(
				`${key} must be a string`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		const values = getEnumValues(PaymentMethodEnum);

		if (!values.includes(p)) {
			throw new CustomError(
				`${key} must be in: ${values.map(v => `'${v}'`)}`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}
	}

	public static platform(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new CustomError(
				`${key} must be a string`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		const values = getEnumValues(PlatformEnum);

		if (!values.includes(p)) {
			throw new CustomError(
				`${key} must be in: ${values.map(v => `'${v}'`)}`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}
	}

	// Diversified

	public static color(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new CustomError(
				`${key} must be a string`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		if (!/^#[A-Fa-f0-9]{6}$/.test(p)) {
			throw new CustomError(
				`${key} must be a valid hex color`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}
	}

	public static url(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new CustomError(
				`${key} must be a string`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		if (!isUrl(p)) {
			throw new CustomError(
				`${key} must be a valid url`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}
	}

	public static money(key: string, p?: any) {
		if (typeof p === "undefined") return;

		if (typeof p !== "number") {
			throw new CustomError(
				`${key} must be a number`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}

		const priceText = p.toFixed(2);

		const nbrFloat = parseFloat(priceText);

		// Validates if the number has more than 2 decimal
		if (isNaN(nbrFloat) || nbrFloat !== p) {
			throw new CustomError(
				`${key} must be a valid money amount`,
				StatusCodeEnum.BAD_REQUEST,
			);
		}
	}

	// Numeric

	public static min(min: number) {
		return (key: string, p?: any) => {
			if (typeof p === "undefined") return;

			if (typeof p !== "number") {
				throw new CustomError(
					`${key} must be a number`,
					StatusCodeEnum.BAD_REQUEST,
				);
			}

			if (p < min) {
				throw new CustomError(
					`${key} must be at least ${min}`,
					StatusCodeEnum.BAD_REQUEST,
				);
			}
		};
	}

	public static max(max: number) {
		return (key: string, p?: any) => {
			if (typeof p === "undefined") return;

			if (typeof p !== "number") {
				throw new CustomError(
					`${key} must be a number`,
					StatusCodeEnum.BAD_REQUEST,
				);
			}

			if (p > max) {
				throw new CustomError(
					`${key} must be at most ${max}`,
					StatusCodeEnum.BAD_REQUEST,
				);
			}
		};
	}
}
