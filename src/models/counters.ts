/**
 *
 *
 * Repository
 *
 *
 */

export type ProductCounterTypes = "SOLD_AMOUNT" | "TOTAL_BILLED";

export type StoreCounterTypes = "SOLD_AMOUNT" | "TOTAL_BILLED";

export interface IncrementProductInput {
	storeId: string;
	productId: string;
	qtd: number;
	type: ProductCounterTypes;
}

export interface IncrementStoreInput {
	storeId: string;
	qtd: number;
	type: StoreCounterTypes;
}

export type TotalCounterTypes = "STORES";

export interface GetTopStoresOutput {
	storeId: string;
	count: number;
}

export interface GetTopProductsOutput {
	storeId: string;
	productId: string;
	count: number;
}

export interface CounterRepository {
	incrementProduct: (p: IncrementProductInput) => Promise<void>;

	incrementStore: (p: IncrementStoreInput) => Promise<void>;

	incrementTotal: (p: TotalCounterTypes) => Promise<void>;

	getTotal: (p: TotalCounterTypes) => Promise<number>;

	getTopStores: () => Promise<Array<GetTopStoresOutput>>;

	getTopProducts: () => Promise<Array<GetTopProductsOutput>>;
}
