/* eslint-disable @typescript-eslint/naming-convention */

import type { AWS } from "@serverless/typescript";
import { merge } from "lodash";
import { config } from "dotenv";

import { resourcesAccount } from "./resources-account";

import { edgeDomain } from "./src/api/edge";
import { vodDomain } from "./src/api/vod";
import { metricsDomain } from "./src/api/metrics";
import { videosDomain } from "./src/api/videos";
import { accountDomain } from "./src/api/account";

config();

const baseConfig: Partial<AWS> = {
	configValidationMode: "error",
	plugins: [
		"serverless-webpack",
		"serverless-localstack",
	],
	frameworkVersion: "3",
	useDotenv: true,
	package: {
		individually: true,
	},
	custom: {
		region: {
			dev: "us-east-2",
			local: "us-east-2",
			production: "us-east-1",
		},
		localstack: {
			host: "http://localstack",
			stages: ["local"],
		},
	},
	provider: {
		name: "aws",
		region: "${self:custom.region.${opt:stage, 'dev'}}" as any,
		runtime: "nodejs16.x",
		memorySize: 512,
		timeout: 10,
		// logRetentionInDays: process.env.NODE_ENV === "production" ? 7 : 1,
		logRetentionInDays: 1,
		apiGateway: {
			minimumCompressionSize: 1024,
			shouldStartNameWithService: true,
		},
		environment: {
			STACK_NAME: "${self:service}-${opt:stage, 'dev'}",
			AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
			NODE_PATH: "./:/opt/node_modules",
			NODE_ENV: "${opt:stage, 'dev'}",
			CLOUD_REGION: "${self:provider.region}",
		},
		iam: {
			role: {
				statements: [
					{
						Effect: "Allow",
						Action: [
							"s3:*",
							"lambda:*",
							"sqs:*",
							"sns:*",
							"dynamodb:*",
							"iam:*",
							"logs:*",
							"cloudfront:*",
						],
						Resource: "*",
					},
				]
			}
		},
		tags: {
			costs: "${self:service}-${opt:stage, 'dev'}",
			environment: "${opt:stage, 'dev'}",
		},
		stackTags: {
			costs: "${self:service}-${opt:stage, 'dev'}",
			environment: "${opt:stage, 'dev'}",
		},
	},
};

const accountConfig = {
	service: "account",
	provider: {
		environment: {
			STRIPE_SECRET_KEY: "${ssm:account-${opt:stage, 'dev'}-stripeSecretKey}",
			SOURCE_EMAIL_TO_SEND_EMAILS: "${ssm:account-${opt:stage, 'dev'}-sourceEmailToSendEmails}",
			VERIFY_ACCOUNT_URL: "${ssm:account-${opt:stage, 'dev'}-verifyAccountUrl}",
		}
	},
	resources: resourcesAccount,
	functions: {
		...accountDomain,
	},
};


const getConfig = () => {
	switch (process.env.DEPLOY_TYPE) {
		case "ACCOUNT":
			return merge(baseConfig, accountConfig);

		case "VOD":
		default:
			return merge(baseConfig, vodConfig);
	}
};

const serverlessConfig = getConfig();

//@ts-ignore
export = serverlessConfig;
