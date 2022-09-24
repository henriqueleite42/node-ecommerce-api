export interface ValidateInput {
	body?: Record<string, any> | null;
	headers?: Record<string, any> | null;
	query?: Record<string, any> | null;
}

export interface Validations<T> {
	key: keyof T;
	loc?: "body" | "headers" | "query";
	validations?: Array<(key: string, p?: any) => void>;
	transform?: Array<(p?: any) => any>;
}

export abstract class Validator<T> {
	public constructor(protected readonly validations: Array<Validations<T>>) {}

	public abstract validate(p: ValidateInput): T;
}
