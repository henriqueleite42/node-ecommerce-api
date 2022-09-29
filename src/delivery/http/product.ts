import type { DeliveryManager } from "../../providers/delivery-manager";

import { create } from "./product/create";
import { del } from "./product/delete";
import { edit } from "./product/edit";
import { getById } from "./product/get-by-id";
import { getPaginated } from "./product/get-paginated";
import { top } from "./product/top";
import { total } from "./product/total";

export const productDomain = (server: DeliveryManager) => {
	server.addSecretsToLoad("monetizzer/auth");
	server.addSecretsToLoad("monetizzer/product");

	create(server);
	del(server);
	edit(server);
	getById(server);
	getPaginated(server);
	top(server);
	total(server);
};
