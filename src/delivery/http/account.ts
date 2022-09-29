import type { DeliveryManager } from "../../providers/delivery-manager";

import { createWithDiscordId } from "./account/create-with-discord-id";
import { getByDiscordId } from "./account/get-by-discord-id";

export const accountDomain = (server: DeliveryManager) => {
	server.addSecretsToLoad("monetizzer/auth");
	server.addSecretsToLoad("monetizzer/account");

	createWithDiscordId(server);
	getByDiscordId(server);
};
