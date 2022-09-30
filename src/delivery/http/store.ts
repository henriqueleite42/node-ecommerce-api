import { create } from "./store/create";
import { edit } from "./store/edit";
import { getByName } from "./store/get-by-name";
import { top } from "./store/top";
import { total } from "./store/total";
import type { DomainInput } from "./types";

export const storeDomain = async ({
	server,
	secretsLoader,
	resourcesLoader,
}: DomainInput) => {
	await secretsLoader.loadSecrets("monetizzer/auth");
	await resourcesLoader.loadSecrets("store");
	await resourcesLoader.loadSecrets("upload");

	create(server);
	edit(server);
	getByName(server);
	top(server);
	total(server);
};
