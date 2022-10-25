import { getContentFile } from "./content/get-content-file";
import { getUrlToUploadMedia } from "./content/get-url-to-upload-media";
import { getUserAccessStores } from "./content/get-user-access-store";
import type { DomainInput } from "./types";

export const contentDomain = async ({ server, secretsLoader }: DomainInput) => {
	await secretsLoader.loadSecrets("monetizzer-auth");

	getContentFile(server);
	getUrlToUploadMedia(server);
	getUserAccessStores(server);
};
