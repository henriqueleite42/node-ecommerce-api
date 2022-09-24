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
import type { Validations as ValidationsType } from "providers/validator";
import { validate } from "uuid";

import { ValidatorProvider } from "./validator";

import { DeliveryMethodEnum } from "types/enums/delivery-method";
import { MediaTypeEnum } from "types/enums/media-type";
import { PaymentMethodEnum } from "types/enums/payment-method";
import { ProductTypeEnum } from "types/enums/product-type";

export class Validations {
	public static required(key: string, p?: any) {
		if (!p) {
			throw new Error(`${key} is a required field`);
		}
	}

	public static limit(key: string, p?: any) {
		if (!p) return;

		if (p < 1 || p > 100) {
			throw new Error(`${key} must be between 1 and 100`);
		}
	}

	public static cursor(key: string, p?: any) {
		if (!p) return;

		if (!/^{.*}$/.test(p)) {
			throw new Error(`${key} must be a valid cursor`);
		}
	}

	public static minLength(minLength: number) {
		return (key: string, p?: any) => {
			if (!p) return;

			if (p.length < minLength) {
				throw new Error(`${key} must have a length of at least ${minLength}`);
			}
		};
	}

	public static maxLength(maxLength: number) {
		return (key: string, p?: any) => {
			if (!p) return;

			if (p.length > maxLength) {
				throw new Error(`${key} must have a length of at least ${maxLength}`);
			}
		};
	}

	public static array(key: string, p?: any) {
		if (!p) return;

		if (!Array.isArray(p)) {
			throw new Error(`${key} must be an array`);
		}
	}

	public static arrOfObj(vArr: Array<Omit<ValidationsType<any>, "loc">>) {
		return (key: string, p?: any) => {
			if (!p) return;

			try {
				const validator = new ValidatorProvider(vArr as any);

				p.forEach((v: any) => {
					validator.validate(v);
				});
			} catch (err: any) {
				throw new Error(`${key}.${err.message}`);
			}
		};
	}

	public static obj(vArr: Array<Omit<ValidationsType<any>, "loc">>) {
		return (key: string, p?: any) => {
			if (!p) return;

			try {
				new ValidatorProvider(vArr as any).validate(p);
			} catch (err: any) {
				throw new Error(`${key}.${err.message}`);
			}
		};
	}

	public static arrayUnique(prop?: string) {
		return (key: string, p?: any) => {
			if (!p) return;

			const values = prop ? p?.map((v: any) => v?.[prop]) : p;

			if (getArrayUniqueValues(values).length !== p?.length) {
				throw new Error(
					prop
						? `${key}.${prop} must have unique values`
						: `${key} must have unique values`,
				);
			}
		};
	}

	// Third Party

	public static discordId(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new Error(`${key} must be a string`);
		}

		if (!/^\d{18}$/.test(p)) {
			throw new Error(`${key} must be a string`);
		}
	}

	// Business

	public static username(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new Error(`${key} must be a string`);
		}

		if (!/^[a-z0-9-]{1,16}$/i.test(p)) {
			throw new Error(`${key} must be a valid code`);
		}
	}

	public static code(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new Error(`${key} must be a string`);
		}

		if (!/^a-z0-9{6}$/i.test(p)) {
			throw new Error(`${key} must be a valid code`);
		}
	}

	public static deliveryMethod(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new Error(`${key} must be a string`);
		}

		const values = getEnumValues(DeliveryMethodEnum);

		if (!values.includes(p)) {
			throw new Error(`${key} must be in: ${values.map(v => `'${v}'`)}`);
		}
	}

	public static productType(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new Error(`${key} must be a string`);
		}

		const values = getEnumValues(ProductTypeEnum);

		if (!values.includes(p)) {
			throw new Error(`${key} must be in: ${values.map(v => `'${v}'`)}`);
		}
	}

	public static productName(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new Error(`${key} must be a string`);
		}

		if (p.length < 1 || p.length > 100) {
			throw new Error(`${key} must have a length between 1 and 100`);
		}
	}

	public static productDescription(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new Error(`${key} must be a string`);
		}

		if (p.length < 1 || p.length > 1000) {
			throw new Error(`${key} must have a length between 1 and 100`);
		}
	}

	public static variationName(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new Error(`${key} must be a string`);
		}

		if (p.length < 1 || p.length > 50) {
			throw new Error(`${key} must have a length between 1 and 100`);
		}
	}

	public static variationDescription(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new Error(`${key} must be a string`);
		}

		if (p.length < 1 || p.length > 500) {
			throw new Error(`${key} must have a length between 1 and 100`);
		}
	}

	public static mediaType(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new Error(`${key} must be a string`);
		}

		const values = getEnumValues(MediaTypeEnum);

		if (!values.includes(p)) {
			throw new Error(`${key} must be in: ${values.map(v => `'${v}'`)}`);
		}
	}

	public static paymentMethod(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new Error(`${key} must be a string`);
		}

		const values = getEnumValues(PaymentMethodEnum);

		if (!values.includes(p)) {
			throw new Error(`${key} must be in: ${values.map(v => `'${v}'`)}`);
		}
	}

	public static pixKey(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new Error(`${key} must be a string`);
		}

		if (!isCpf(p) && !isCnpj(p) && !isEmail(p) && !isBrazilianPhone(p)) {
			throw new Error(`${key} must be a valid pix key`);
		}
	}

	public static saleOrigin(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new Error(`${key} must be a string`);
		}

		if (!p.startsWith("DISCORD#")) {
			throw new Error(`${key} must be a valid origin`);
		}
	}
	// Diversified

	public static uuid(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new Error(`${key} must be a string`);
		}

		if (!validate(p)) {
			throw new Error(`${key} must be a valid uuid`);
		}
	}

	public static color(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new Error(`${key} must be a string`);
		}

		if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(p)) {
			throw new Error(`${key} must be a valid hex color`);
		}
	}

	public static url(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "string") {
			throw new Error(`${key} must be a string`);
		}

		if (!isUrl(p)) {
			throw new Error(`${key} must be a valid url`);
		}
	}

	public static money(key: string, p?: any) {
		if (!p) return;

		if (typeof p !== "number") {
			throw new Error(`${key} must be a number`);
		}

		const priceText = p.toFixed(2);

		const nbrFloat = parseFloat(priceText);

		// Validates if the number has more than 2 decimal
		if (isNaN(nbrFloat) || nbrFloat !== p) {
			throw new Error(`${key} must be a valid money amount`);
		}
	}

	// Numeric

	public static min(min: number) {
		return (key: string, p?: any) => {
			if (!p) return;

			if (typeof p !== "number") {
				throw new Error(`${key} must be a number`);
			}

			if (p < min) {
				throw new Error(`${key} must be at least ${min}`);
			}
		};
	}

	public static max(max: number) {
		return (key: string, p?: any) => {
			if (!p) return;

			if (typeof p !== "number") {
				throw new Error(`${key} must be a number`);
			}

			if (p > max) {
				throw new Error(`${key} must be at most ${max}`);
			}
		};
	}
}
