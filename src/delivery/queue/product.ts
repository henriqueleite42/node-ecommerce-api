import { incrementProductsCount } from "./product/increment-products-count";
import { incrementSalesCount } from "./product/increment-sales-count";
import { incrementTotalBilled } from "./product/increment-total-billed";
import { updateImg } from "./product/update-img";

export const product = {
	productIncrementProductsCount: incrementProductsCount,
	productIncrementSalesCount: incrementSalesCount,
	productIncrementTotalBilled: incrementTotalBilled,
	productUpdateImg: updateImg,
};
