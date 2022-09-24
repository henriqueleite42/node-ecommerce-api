import { create } from "./http/store/create";
import { edit } from "./http/store/edit";
import { top } from "./http/store/top";
import { total } from "./http/store/total";
import { incrementSalesCount } from "./queue/store/increment-sales-count";
import { incrementStoresCount } from "./queue/store/increment-stores-count";
import { incrementTotalBilled } from "./queue/store/increment-total-billed";

export const store = {
	storeCreate: create,
	storeEdit: edit,
	storeTop: top,
	storeTotal: total,
	storeIncrementSalesCount: incrementSalesCount,
	storeIncrementStoresCount: incrementStoresCount,
	storeIncrementTotalBilled: incrementTotalBilled,
};
