import type { SecretManager } from "../../adapters/secret-manager";
import type { DeliveryManager } from "../../providers/delivery-manager";

export interface DomainInput {
	server: DeliveryManager;
	secretsLoader: SecretManager;
	resourcesLoader: SecretManager;
}
