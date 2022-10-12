import { getContentFile } from "./content/get-content-file";
import { getUrlToUploadMedia } from "./content/get-url-to-upload-media";
import type { DomainInput } from "./types";

export const contentDomain = async ({ server, secretsLoader }: DomainInput) => {
	await secretsLoader.loadSecrets("monetizzer/content");

	getContentFile(server);
	getUrlToUploadMedia(server);
};
