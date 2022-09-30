import { create } from "./product/create";
import { del } from "./product/delete";
import { edit } from "./product/edit";
import { getById } from "./product/get-by-id";
import { getPaginated } from "./product/get-paginated";
import { top } from "./product/top";
import { total } from "./product/total";
import type { DomainInput } from "./types";

export const productDomain = async ({
	server,
	secretsLoader,
	resourcesLoader,
}: DomainInput) => {
	await secretsLoader.loadSecrets("monetizzer/auth");
	await resourcesLoader.loadSecrets("product");
	await resourcesLoader.loadSecrets("upload");

	create(server);
	del(server);
	edit(server);
	getById(server);
	getPaginated(server);
	top(server);
	total(server);
};
