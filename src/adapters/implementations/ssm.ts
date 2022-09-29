/* eslint-disable @typescript-eslint/naming-convention */

import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

import type { SecretManager, GetSecretsInput } from "../secret-manager";

export class SSMAdapter implements SecretManager {
	private readonly ssm: SSMClient;

	public constructor() {
		this.ssm = new SSMClient({});
	}

	public getSecrets<S>({ from }: GetSecretsInput) {
		return this.ssm
			.send(
				new GetParameterCommand({
					Name: from,
				}),
			)
			.then(
				r => (r.Parameter?.Value ? JSON.parse(r.Parameter.Value) : {}) as S,
			);
	}
}
