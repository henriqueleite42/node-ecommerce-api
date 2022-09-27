import { create } from "./http/store/create";
import { edit } from "./http/store/edit";
import { getByName } from "./http/store/get-by-name";
import { top } from "./http/store/top";
import { total } from "./http/store/total";
import { incrementSalesCount } from "./queue/store/increment-sales-count";
import { incrementStoresCount } from "./queue/store/increment-stores-count";
import { incrementTotalBilled } from "./queue/store/increment-total-billed";
import { updateAvatar } from "./queue/store/update-avatar";
import { updateBanner } from "./queue/store/update-banner";

export const store = {
	storeCreate: create,
	storeEdit: edit,
	storeGetByName: getByName,
	storeTop: top,
	storeTotal: total,
	storeUpdateAvatar: updateAvatar,
	storeUpdateBanner: updateBanner,
	storeIncrementSalesCount: incrementSalesCount,
	storeIncrementStoresCount: incrementStoresCount,
	storeIncrementTotalBilled: incrementTotalBilled,
};
