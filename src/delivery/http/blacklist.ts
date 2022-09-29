import type { DeliveryManager } from "../../providers/delivery-manager";

import { blacklist } from "./blacklist/blacklist";

export const blacklistDomain = (server: DeliveryManager) => {
	server.addSecretsToLoad("monetizzer/auth");

	blacklist(server);
};
