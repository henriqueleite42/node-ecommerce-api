import { deleteAllFromDiscordGuild } from "./event-alerts/delete-all-from-discord-guild";
import type { DomainInput } from "./types";

export const eventAlertDomainDomain = async ({
	server,
	secretsLoader,
}: DomainInput) => {
	await secretsLoader.loadSecrets("monetizzer/auth");

	deleteAllFromDiscordGuild(server);
};
