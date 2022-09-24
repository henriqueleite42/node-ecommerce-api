import type { ValidateInput } from "providers/validator";
import { Validator } from "providers/validator";

export class ValidatorProvider<T> extends Validator<T> {
	public validate(p: ValidateInput) {
		const entries = this.validations.map(
			({ key, loc, validations, transform }) => {
				const value = loc ? p?.[loc]?.[key as any] : (p as any)?.[key as any];

				validations?.forEach(v => v(key as string, value));

				if (transform) {
					const transformLength = transform.length;
					let finalValue = value;

					for (let i = 0; i < transformLength; i++) {
						finalValue = transform[i](finalValue);
					}

					return [key, finalValue];
				}

				return [key, value];
			},
		);

		return Object.fromEntries(entries);
	}
}
