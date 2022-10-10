import { incrementProductsCount } from "./product/increment-products-count";
import { incrementSalesCount } from "./product/increment-sales-count";
import { incrementTotalBilled } from "./product/increment-total-billed";

export const productSQS = {
	productSQSIncrementProductsCount: incrementProductsCount,
	productSQSIncrementSalesCount: incrementSalesCount,
	productSQSIncrementTotalBilled: incrementTotalBilled,
};
