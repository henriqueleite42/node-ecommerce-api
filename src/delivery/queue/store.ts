import { addProductType } from "./store/add-product-type";
import { incrementSalesCount } from "./store/increment-sales-count";
import { incrementStoresCount } from "./store/increment-stores-count";
import { incrementTotalBilled } from "./store/increment-total-billed";
import { removeProductType } from "./store/remove-product-type";

export const storeSQS = {
	storeSQSAddProductType: addProductType,
	storeSQSIncrementSalesCount: incrementSalesCount,
	storeSQSIncrementStoresCount: incrementStoresCount,
	storeSQSIncrementTotalBilled: incrementTotalBilled,
	storeSQSRemoveProductType: removeProductType,
};
