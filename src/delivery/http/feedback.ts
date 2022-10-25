import { changeVisibility } from "./feedback/change-visibility";
import { create } from "./feedback/create";
import { getMany } from "./feedback/get-many";
import type { DomainInput } from "./types";

export const feedbackDomain = async ({
	server,
	secretsLoader,
}: DomainInput) => {
	await secretsLoader.loadSecrets("monetizzer/auth");

	changeVisibility(server);
	create(server);
	getMany(server);
};
