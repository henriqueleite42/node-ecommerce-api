export interface ValidateInput {
	auth?: Record<string, any> | null;
	path?: Record<string, any> | null;
	body?: Record<string, any> | null;
	headers?: Record<string, any> | null;
	query?: Record<string, any> | null;
}

export interface Validations<T> {
	key: keyof T; // Prop name on the final object
	as?: string; // Prop name on body / auth / etc object
	loc?: keyof ValidateInput;
	validations?: Array<(key: string, p?: any) => void>;
	transform?: Array<(p?: any) => any>;
}

export abstract class Validator<T> {
	public constructor(protected readonly validations: Array<Validations<T>>) {}

	public abstract validate(p: ValidateInput): T;
}
