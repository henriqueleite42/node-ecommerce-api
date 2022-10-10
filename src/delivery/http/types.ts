import type { SecretManager } from "../../adapters/secret-manager";
import type { HttpManager } from "../../providers/http-manager";

export interface DomainInput {
	server: HttpManager;
	secretsLoader: SecretManager;
	resourcesLoader: SecretManager;
}
