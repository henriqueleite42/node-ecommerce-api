export interface GetSecretsInput {
	from: string;
}

export interface SecretManager {
	getSecrets: (p: GetSecretsInput) => Promise<Record<string, string>>;
}
