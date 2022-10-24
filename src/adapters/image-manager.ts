import type { StoreEntity } from "../models/store";

export interface GenTopStoresInput {
	stores: Array<StoreEntity>;
}

export interface ImageManager {
	genTopStores: (p: GenTopStoresInput) => Promise<Buffer>;
}
