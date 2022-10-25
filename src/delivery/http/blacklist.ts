import { blacklist } from "./blacklist/blacklist";
import type { DomainInput } from "./types";

export const blacklistDomain = async ({
	server,
	secretsLoader,
}: DomainInput) => {
	await secretsLoader.loadSecrets("monetizzer-auth");

	blacklist(server);
};
