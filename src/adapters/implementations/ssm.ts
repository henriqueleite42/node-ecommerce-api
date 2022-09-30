/* eslint-disable @typescript-eslint/naming-convention */

import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

import { SecretManager } from "../secret-manager";

export class SSMAdapter extends SecretManager {
	private readonly ssm: SSMClient;

	public constructor() {
		super();
		this.ssm = new SSMClient({});
	}

	public async loadSecrets(secretName: string) {
		if (this.isSecretLoaded(secretName)) return;

		const result = await this.ssm
			.send(
				new GetParameterCommand({
					Name: secretName,
				}),
			)
			.then(r => (r.Parameter?.Value ? JSON.parse(r.Parameter.Value) : {}));

		process.env = {
			...process.env,
			...result,
		};

		super.secretLoaded(secretName);
	}
}
