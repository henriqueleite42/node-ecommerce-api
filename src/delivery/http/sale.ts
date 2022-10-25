import { addCoupon } from "./sale/add-coupon";
import { addProduct } from "./sale/add-product";
import { checkout } from "./sale/checkout";
import { confirmDelivery } from "./sale/confirm-delivery";
import { create } from "./sale/create";
import { deliver } from "./sale/deliver";
import { processPixPayment } from "./sale/process-pix-payment";
import { seeCart } from "./sale/see-cart";
import type { DomainInput } from "./types";

export const saleDomain = async ({
	server,
	secretsLoader,
	resourcesLoader,
}: DomainInput) => {
	await secretsLoader.loadSecrets("monetizzer-auth");
	await secretsLoader.loadSecrets("monetizzer-gerencianet");
	await secretsLoader.loadSecrets("monetizzer-gerencianet-certs-cert");
	await secretsLoader.loadSecrets("monetizzer-gerencianet-certs-key");
	await resourcesLoader.loadSecrets("sale");

	addCoupon(server);
	addProduct(server);
	checkout(server);
	confirmDelivery(server);
	create(server);
	deliver(server);
	processPixPayment(server);
	seeCart(server);
};
