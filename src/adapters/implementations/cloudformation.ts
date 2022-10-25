/* eslint-disable @typescript-eslint/naming-convention */

import {
	CloudFormationClient,
	DescribeStacksCommand,
} from "@aws-sdk/client-cloudformation";
import { constantCase } from "change-case";

import { SecretManager } from "../secret-manager";

export class CloudformationAdapter extends SecretManager {
	private readonly cloudformation: CloudFormationClient;

	public constructor() {
		super();
		this.cloudformation = new CloudFormationClient({});
	}

	public async loadSecrets(secretName: string) {
		const fullSecretName = `${secretName}-${process.env.NODE_ENV}`;

		if (this.isSecretLoaded(fullSecretName)) return;

		const stacks = await this.cloudformation.send(
			new DescribeStacksCommand({
				StackName: fullSecretName,
			}),
		);

		if (!stacks.Stacks || stacks.Stacks.length === 0) {
			throw new Error("Stack not found");
		}

		const stack = stacks.Stacks.shift()!;

		if (!stack.Outputs) {
			throw new Error("Stack has no outputs");
		}

		stack.Outputs.forEach(({ OutputKey, OutputValue }) => {
			const [stackName, key] = OutputKey!.split(":");

			const domain = stackName.split("-").shift()!;

			const envVarName = constantCase(`${domain}${key}`);

			process.env[envVarName] = OutputValue!;
		});

		super.secretLoaded(fullSecretName);
	}
}
