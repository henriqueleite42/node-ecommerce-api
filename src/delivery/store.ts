import { create } from "./http/store/create/handler";
import { edit } from "./http/store/edit/handler";
import { top } from "./http/store/top/handler";
import { incrementSalesCount } from "./queue/store/increment-sales-count/handler";
import { incrementTotalBilled } from "./queue/store/increment-total-billed/handler";

export const storeDomain = {
	storeDomainCreate: create,
	storeDomainEdit: edit,
	storeDomainTop: top,
	storeDomainIncrementSalesCount: incrementSalesCount,
	storeDomainIncrementTotalBilled: incrementTotalBilled,
};
