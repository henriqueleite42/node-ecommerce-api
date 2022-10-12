import { create } from "./store/create";
import { edit } from "./store/edit";
import { getById } from "./store/get-by-id";
import { getByName } from "./store/get-by-name";
import { getUrlToUploadAvatar } from "./store/get-url-to-upload-avatar";
import { getUrlToUploadBanner } from "./store/get-url-to-upload-banner";
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
	getById(server);
	getByName(server);
	getUrlToUploadAvatar(server);
	getUrlToUploadBanner(server);
	top(server);
	total(server);
};
