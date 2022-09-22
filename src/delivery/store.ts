import { create } from "./http/store/create/handler";
import { edit } from "./http/store/edit/handler";
import { top } from "./http/store/top/handler";
import { incrementSalesCount } from "./queue/store/increment-sales-count/handler";
import { incrementTotalBilled } from "./queue/store/increment-total-billed/handler";

export const store = {
	storeCreate: create,
	storeEdit: edit,
	storeTop: top,
	storeIncrementSalesCount: incrementSalesCount,
	storeIncrementTotalBilled: incrementTotalBilled,
};
