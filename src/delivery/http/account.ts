import { createWithDiscordId } from "./account/create-with-discord-id";
import { getByDiscordId } from "./account/get-by-discord-id";
import type { DomainInput } from "./types";

export const accountDomain = async ({ server, secretsLoader }: DomainInput) => {
	await secretsLoader.loadSecrets("monetizzer/auth");

	createWithDiscordId(server);
	getByDiscordId(server);
};
