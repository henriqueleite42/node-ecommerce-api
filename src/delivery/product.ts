import { incrementProductsCount } from "./queue/product/increment-products-count";
import { incrementSalesCount } from "./queue/product/increment-sales-count";
import { incrementTotalBilled } from "./queue/product/increment-total-billed";
import { updateImg } from "./queue/product/update-img";

export const product = {
	productIncrementProductsCount: incrementProductsCount,
	productIncrementSalesCount: incrementSalesCount,
	productIncrementTotalBilled: incrementTotalBilled,
	productUpdateImg: updateImg,
};
