import { addProduct } from "./sale/add-product";
import { checkout } from "./sale/checkout";
import { create } from "./sale/create";
import { processPixPayment } from "./sale/process-pix-payment";
import { seeCart } from "./sale/see-cart";
import type { DomainInput } from "./types";

export const saleDomain = async ({
	server,
	secretsLoader,
	resourcesLoader,
}: DomainInput) => {
	await secretsLoader.loadSecrets("monetizzer/auth");
	await secretsLoader.loadSecrets("monetizzer/gerencianet");
	await secretsLoader.loadSecrets("monetizzer/gerencianet-certs-cert");
	await secretsLoader.loadSecrets("monetizzer/gerencianet-certs-key");
	await resourcesLoader.loadSecrets("sale");

	addProduct(server);
	checkout(server);
	create(server);
	processPixPayment(server);
	seeCart(server);
};
