export type BaseRouteFunc<I> = (
	p: I,
	...extra: any
) => Promise<Record<string, any>> | Record<string, any> | undefined;

export abstract class Route<F> {
	protected func: F;

	public setFunc(func: F) {
		this.func = func;

		return this;
	}

	public abstract execFunc(params: any): any;
}

export abstract class DeliveryManager {
	protected secretsToBeLoaded = [] as Array<string>;

	public abstract addRoute<I>(
		config: any,
		r: (route: Route<BaseRouteFunc<I>>) => Route<BaseRouteFunc<I>>,
	): this;
}
