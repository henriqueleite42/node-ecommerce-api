import { addProductType } from "./store/add-product-type";
import { incrementSalesCount } from "./store/increment-sales-count";
import { incrementStoresCount } from "./store/increment-stores-count";
import { incrementTotalBilled } from "./store/increment-total-billed";
import { removeProductType } from "./store/remove-product-type";
import { updateAvatar } from "./store/update-avatar";
import { updateBanner } from "./store/update-banner";

export const storeSQS = {
	storeSQSAddProductType: addProductType,
	storeSQSIncrementSalesCount: incrementSalesCount,
	storeSQSIncrementStoresCount: incrementStoresCount,
	storeSQSIncrementTotalBilled: incrementTotalBilled,
	storeSQSRemoveProductType: removeProductType,
	storeSQSUpdateAvatar: updateAvatar,
	storeSQSUpdateBanner: updateBanner,
};
