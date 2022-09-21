import { addProduct } from "./http/sale/add-product/handler";
import { create } from "./http/sale/create/handler";
import { seeCart } from "./http/sale/see-cart/handler";
import { updateStatus } from "./http/sale/update-status/handler";
import { processPayment } from "./queue/sale/process-payment/handler";

export const saleDomain = {
	saleDomainAddProduct: addProduct,
	saleDomainCreate: create,
	saleDomainSeeCart: seeCart,
	saleDomainUpdateStatus: updateStatus,
	saleDomainProcessPayment: processPayment,
};
