export abstract class SecretManager {
	private readonly secretsLoaded = [] as Array<string>;

	public abstract loadSecrets(secretName: string): Promise<void>;

	protected secretLoaded(secretName: string) {
		this.secretsLoaded.push(secretName);
	}

	protected isSecretLoaded(secretName: string) {
		return this.secretsLoaded.includes(secretName);
	}
}
