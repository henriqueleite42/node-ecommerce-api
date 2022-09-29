import type { DeliveryManager } from "../../providers/delivery-manager";

import { addProduct } from "./sale/add-product";
import { checkout } from "./sale/checkout";
import { create } from "./sale/create";
import { seeCart } from "./sale/see-cart";

export const saleDomain = (server: DeliveryManager) => {
	server.addSecretsToLoad("monetizzer/auth");
	server.addSecretsToLoad("monetizzer/sale");
	server.addSecretsToLoad("monetizzer/gerencianet");
	server.addSecretsToLoad("monetizzer/gerencianet-certs-cert");
	server.addSecretsToLoad("monetizzer/gerencianet-certs-key");

	addProduct(server);
	checkout(server);
	create(server);
	seeCart(server);
};
