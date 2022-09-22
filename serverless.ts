/* eslint-disable @typescript-eslint/naming-convention */

import type { AWS } from "@serverless/typescript";
import { merge } from "lodash";
import { config } from "dotenv";

import { resourcesAccess } from "./resources-access";
import { resourcesAccount } from "./resources-account";
import { resourcesContent } from "./resources-content";
import { resourcesCounter } from "./resources-counter";
import { resourcesProduct } from "./resources-product";
import { resourcesSale } from "./resources-sale";
import { resourcesStore } from "./resources-store";

import { access } from "./src/delivery/access";
import { account } from "./src/delivery/account";
import { content } from "./src/delivery/content";
import { product } from "./src/delivery/product";
import { sale } from "./src/delivery/sale";
import { store } from "./src/delivery/store";
import { upload } from "./src/delivery/upload";

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
		timeout: 5,
		// logRetentionInDays: process.env.NODE_ENV === "production" ? 7 : 1,
		logRetentionInDays: 1,
		apiGateway: {
			minimumCompressionSize: 1024,
			shouldStartNameWithService: false,
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
							"ssm:*",
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

const accessConfig = {
	service: "access",
	resources: resourcesAccess,
	functions: access,
};

const accountConfig = {
	service: "account",
	resources: resourcesAccount,
	functions: account,
};

const contentConfig = {
	service: "content",
	resources: resourcesContent,
	functions: content,
};

const counterConfig = {
	service: "counter",
	resources: resourcesCounter,
};

const productConfig = {
	service: "product",
	resources: resourcesProduct,
	functions: product,
};

const saleConfig = {
	service: "sale",
	resources: resourcesSale,
	functions: sale,
};

const storeConfig = {
	service: "store",
	resources: resourcesStore,
	functions: store,
};

const uploadConfig = {
	service: "upload",
	functions: upload,
};

const getConfig = () => {
	switch (process.env.DEPLOY_TYPE) {
		case "ACCESS":
			return merge(baseConfig, accessConfig);

		case "ACCOUNT":
			return merge(baseConfig, accountConfig);

		case "CONTENT":
			return merge(baseConfig, contentConfig);

		case "COUNTER":
			return merge(baseConfig, counterConfig);

		case "PRODUCT":
			return merge(baseConfig, productConfig);

		case "SALE":
			return merge(baseConfig, saleConfig);

		case "STORE":
			return merge(baseConfig, storeConfig);

		case "UPLOAD":
			return merge(baseConfig, uploadConfig);

		default:
			throw new Error("Invalid module")
	}
};

const serverlessConfig = getConfig();

//@ts-ignore
export = serverlessConfig;
