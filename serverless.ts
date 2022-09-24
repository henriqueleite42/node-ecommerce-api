/* eslint-disable @typescript-eslint/naming-convention */

import type { AWS } from "@serverless/typescript";
import { merge } from "lodash";
import { config } from "dotenv";

import { resourcesAccount } from "./resources-account";
import { resourcesContent } from "./resources-content";
import { resourcesCounter } from "./resources-counter";
import { resourcesProduct } from "./resources-product";
import { resourcesSale } from "./resources-sale";
import { resourcesStore } from "./resources-store";
import { resourcesUpload } from "./resources-upload";
import { resourcesWallet } from "./resources-wallet";

import { account } from "./src/delivery/account";
import { content } from "./src/delivery/content";
import { product } from "./src/delivery/product";
import { sale } from "./src/delivery/sale";
import { store } from "./src/delivery/store";
import { upload } from "./src/delivery/upload";
import { wallet } from "./src/delivery/wallet";

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

const accountConfig = {
	service: "account",
	provider: {
		environment: {
			ACCESS_CREATED_TOPIC_ARN: {
				Ref: "AccessCreatedTopicArn"
			},
		}
	},
	resources: resourcesAccount,
	functions: account,
};

const contentConfig = {
	service: "content",
	provider: {
		environment: {
			UPDATE_RAW_IMG_QUEUE_URL: {
				Ref: "UpdateRawImgQueue"
			},
		}
	},
	resources: resourcesContent,
	functions: content,
};

const counterConfig = {
	service: "counter",
	resources: resourcesCounter,
};

const productConfig = {
	service: "product",
	provider: {
		environment: {
			UPDATE_IMG_QUEUE_URL: {
				Ref: "UpdateImgQueue"
			},
		}
	},
	resources: resourcesProduct,
	functions: product,
};

const saleConfig = {
	service: "sale",
	provider: {
		environment: {
			SALE_CREATED_TOPIC_ARN: {
				Ref: "SaleCreatedTopicArn"
			},
			PAYMENT_PROCESSED_TOPIC_ARN: {
				Ref: "PaymentProcessedTopicArn"
			},
		}
	},
	resources: resourcesSale,
	functions: sale,
};

const storeConfig = {
	service: "store",
	provider: {
		environment: {
			STORE_CREATED_TOPIC_ARN: {
				Ref: "StoreCreatedTopicArn"
			},
		}
	},
	resources: resourcesStore,
	functions: store,
};

const uploadConfig = {
	service: "upload",
	provider: {
		environment: {
			UPLOAD_FROM_URL_QUEUE_URL: {
				Ref: "UploadFromUrlQueue"
			},
		}
	},
	resources: resourcesUpload,
	functions: upload,
};

const walletConfig = {
	service: "wallet",
	resources: resourcesWallet,
	functions: wallet,
};

const getConfig = () => {
	switch (process.env.DEPLOY_TYPE) {
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

		case "WALLET":
			return merge(baseConfig, walletConfig);

		default:
			throw new Error("Invalid module")
	}
};

const serverlessConfig = getConfig();

//@ts-ignore
export = serverlessConfig;
