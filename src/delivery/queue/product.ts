import { incrementProductsCount } from "./product/increment-products-count";
import { incrementSalesCount } from "./product/increment-sales-count";
import { incrementTotalBilled } from "./product/increment-total-billed";
import { processDelayedCreatedNotification } from "./product/process-delayed-created-notification";

export const productSQS = {
	productSQSIncrementProductsCount: incrementProductsCount,
	productSQSIncrementSalesCount: incrementSalesCount,
	productSQSIncrementTotalBilled: incrementTotalBilled,
	productSQSProcessDelayedCreateNotif: processDelayedCreatedNotification,
};
