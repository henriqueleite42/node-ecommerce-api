import { createMagicLink } from "./account/create-magic-link";
import { createWithDiscord } from "./account/create-with-discord";
import { createWithDiscordId } from "./account/create-with-discord-id";
import { getByDiscordId } from "./account/get-by-discord-id";
import { signInWithMagicLink } from "./account/sign-in-with-magic-link";
import type { DomainInput } from "./types";

export const accountDomain = async ({ server, secretsLoader }: DomainInput) => {
	await secretsLoader.loadSecrets("monetizzer/auth");

	createMagicLink(server);
	createWithDiscordId(server);
	createWithDiscord(server);
	getByDiscordId(server);
	signInWithMagicLink(server);
};
