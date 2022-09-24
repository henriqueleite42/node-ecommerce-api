import { addProduct } from "./http/sale/add-product";
import { checkout } from "./http/sale/checkout";
import { create } from "./http/sale/create";
import { seeCart } from "./http/sale/see-cart";
import { processPayment } from "./queue/sale/process-payment";

export const sale = {
	saleAddProduct: addProduct,
	saleCreate: create,
	saleSeeCart: seeCart,
	saleCheckout: checkout,
	saleProcessPayment: processPayment,
};
