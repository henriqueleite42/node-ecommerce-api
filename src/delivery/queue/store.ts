import { incrementSalesCount } from "./store/increment-sales-count";
import { incrementStoresCount } from "./store/increment-stores-count";
import { incrementTotalBilled } from "./store/increment-total-billed";
import { updateAvatar } from "./store/update-avatar";
import { updateBanner } from "./store/update-banner";

export const store = {
	storeUpdateAvatar: updateAvatar,
	storeUpdateBanner: updateBanner,
	storeIncrementSalesCount: incrementSalesCount,
	storeIncrementStoresCount: incrementStoresCount,
	storeIncrementTotalBilled: incrementTotalBilled,
};
