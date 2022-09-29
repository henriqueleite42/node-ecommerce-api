import type { DeliveryManager } from "../../providers/delivery-manager";

import { create } from "./store/create";
import { edit } from "./store/edit";
import { getByName } from "./store/get-by-name";
import { top } from "./store/top";
import { total } from "./store/total";

export const storeDomain = (server: DeliveryManager) => {
	server.addSecretsToLoad("monetizzer/auth");
	server.addSecretsToLoad("monetizzer/store");

	create(server);
	edit(server);
	getByName(server);
	top(server);
	total(server);
};
