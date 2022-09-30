import type { AWS } from "@serverless/typescript";
import { merge } from "lodash";

import { resourcesAccount } from "./resources-account";
import { resourcesBlacklist } from "./resources-blacklist";
import { resourcesContent } from "./resources-content";
import { resourcesCounter } from "./resources-counter";
import { resourcesEventAlert } from "./resources-event-alert";
import { resourcesProduct } from "./resources-product";
import { resourcesSale } from "./resources-sale";
import { resourcesStore } from "./resources-store";
import { resourcesUpload } from "./resources-upload";
import { resourcesWallet } from "./resources-wallet";

import { content } from "./src/delivery/queue/content";
import { eventAlert } from "./src/delivery/queue/event-alert";
import { product } from "./src/delivery/queue/product";
import { store } from "./src/delivery/queue/store";
import { upload } from "./src/delivery/queue/upload";
import { wallet } from "./src/delivery/queue/wallet";

const baseConfig: Partial<AWS> = {
	plugins: [
		"serverless-localstack",
	],
	configValidationMode: "error",
	frameworkVersion: "3",
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
			host: "http://localhost",
			stages: ["local"],
		},
	},
	provider: {
		name: "aws",
		region: "${self:custom.region.${opt:stage, 'local'}}" as any,
		runtime: "nodejs16.x",
		memorySize: 512,
		timeout: 5,
		logRetentionInDays: process.env.NODE_ENV === "production" ? 3 : 1,
		apiGateway: {
			minimumCompressionSize: 1024,
			shouldStartNameWithService: false,
		},
		environment: {
			STACK_NAME: "${self:service}-${opt:stage, 'local'}",
			AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
			NODE_ENV: "${opt:stage, 'local'}",
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
							"ssm:*",
						],
						Resource: "*",
					},
				]
			}
		},
		tags: {
			costs: "${self:service}-${opt:stage, 'local'}",
			environment: "${opt:stage, 'local'}",
		},
		stackTags: {
			costs: "${self:service}-${opt:stage, 'local'}",
			environment: "${opt:stage, 'local'}",
		},
	},
};

const accountConfig = {
	service: "account",
	resources: resourcesAccount,
};

const contentConfig = {
	service: "content",
	plugins: [
		"serverless-webpack",
	],
	resources: resourcesContent,
	functions: content,
};

const counterConfig = {
	service: "counter",
	resources: resourcesCounter,
};

const eventsAlertsConfig = {
	service: "event-alert",
	plugins: [
		"serverless-webpack",
	],
	resources: resourcesEventAlert,
	functions: eventAlert,
};

const blacklistConfig = {
	service: "blacklist",
	resources: resourcesBlacklist,
};

const productConfig = {
	service: "product",
	plugins: [
		"serverless-webpack",
	],
	resources: resourcesProduct,
	functions: product,
};

const saleConfig = {
	service: "sale",
	resources: resourcesSale,
};

const storeConfig = {
	service: "store",
	plugins: [
		"serverless-webpack",
	],
	resources: resourcesStore,
	functions: store,
};

const uploadConfig = {
	service: "upload",
	plugins: [
		"serverless-webpack",
	],
	resources: resourcesUpload,
	functions: upload,
};

const walletConfig = {
	service: "wallet",
	plugins: [
		"serverless-webpack",
	],
	resources: resourcesWallet,
	functions: wallet,
};

/**
 *
 * Every time that a new domain is added,
 * you have to add it too to the
 * `./scripts/deploy-serverless-*` scripts
 *
 */
const getConfig = () => {
	switch (process.env.API_MODULE) {
		case "ACCOUNT":
			return merge(baseConfig, accountConfig);

		case "BLACKLIST":
			return merge(baseConfig, blacklistConfig);

		case "CONTENT":
			return merge(baseConfig, contentConfig);

		case "COUNTER":
			return merge(baseConfig, counterConfig);

		case "EVENT-ALERT":
			return merge(baseConfig, eventsAlertsConfig);

		case "PRODUCT":
			return merge(baseConfig, productConfig);

		case "SALE":
			return merge(baseConfig, saleConfig);

		case "STORE":
			return merge(baseConfig, storeConfig);

		case "UPLOAD":
			return merge(baseConfig, uploadConfig);

		case "WALLET":
			return merge(baseConfig, walletConfig);

		default:
			throw new Error("Missing API_MODULE env var");
	}
};

const serverlessConfig = getConfig();

//@ts-ignore
export = serverlessConfig;
