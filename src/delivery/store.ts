import { incrementSalesCount } from "./queue/store/increment-sales-count";
import { incrementStoresCount } from "./queue/store/increment-stores-count";
import { incrementTotalBilled } from "./queue/store/increment-total-billed";
import { updateAvatar } from "./queue/store/update-avatar";
import { updateBanner } from "./queue/store/update-banner";

export const store = {
	storeUpdateAvatar: updateAvatar,
	storeUpdateBanner: updateBanner,
	storeIncrementSalesCount: incrementSalesCount,
	storeIncrementStoresCount: incrementStoresCount,
	storeIncrementTotalBilled: incrementTotalBilled,
};
