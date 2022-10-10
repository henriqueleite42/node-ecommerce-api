type Func<I> = (
	p: I,
) => Promise<Record<string, any>> | Record<string, any> | undefined;

export abstract class Route<I> {
	protected func: Func<I>;

	public setFunc(func: Func<I>) {
		this.func = func;

		return this;
	}

	public abstract execFunc(params: any): any;
}

export abstract class DeliveryManager {
	protected secretsToBeLoaded = [] as Array<string>;

	public abstract addRoute<I>(
		config: any,
		r: (route: Route<I>) => Route<I>,
	): this;
}
