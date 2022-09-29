/* eslint-disable @typescript-eslint/naming-convention */

import type { AWS } from "@serverless/typescript";
import { merge } from "lodash";
import { config } from "dotenv";

import { resourcesAccount } from "./resources-account";
import { resourcesBlacklist } from "./resources-blacklist";
import { resourcesContent } from "./resources-content";
import { resourcesCounter } from "./resources-counter";
import { resourcesProduct } from "./resources-product";
import { resourcesSale } from "./resources-sale";
import { resourcesStore } from "./resources-store";
import { resourcesUpload } from "./resources-upload";
import { resourcesWallet } from "./resources-wallet";

import { content } from "./src/delivery/content";
import { product } from "./src/delivery/product";
import { sale } from "./src/delivery/sale";
import { store } from "./src/delivery/store";
import { upload } from "./src/delivery/upload";
import { wallet } from "./src/delivery/wallet";

// You need to change this if you changed the one at docker-events-listener-build/listen-docker-events.sh
const SERVICE_NAME = "monetizzer";

config();

const baseConfig: Partial<AWS> = {
	plugins: [
		"serverless-localstack",
	],
	configValidationMode: "error",
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
			API_BOT_TOKEN: `\${ssm:${SERVICE_NAME}-\${opt:stage, 'local'}-apiBotToken}`,
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
	provider: {
		environment: {
			UPLOAD_FROM_URL_QUEUE_URL: {
				"Fn::ImportValue": "upload-${opt:stage, 'local'}:UploadFromUrlQueueUrl",
			},
			UPDATE_RAW_IMG_QUEUE_URL: {
				Ref: "UpdateRawImgQueue"
			},
			RAW_MEDIA_BUCKET_NAME: {
				Ref: "RawMediaStorage"
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

const blacklistConfig = {
	service: "blacklist",
	resources: resourcesBlacklist,
};

const productConfig = {
	service: "product",
	plugins: [
		"serverless-webpack",
	],
	provider: {
		environment: {
			UPLOAD_FROM_URL_QUEUE_URL: {
				"Fn::ImportValue": "upload-${opt:stage, 'local'}:UploadFromUrlQueueUrl",
			},
			UPDATE_IMG_QUEUE_URL: {
				Ref: "UpdateImgQueue"
			},
			IMAGES_PREFIX_URL: {
				"Fn::Join": [
					"",
					[
						"https://",
						{
							"Fn::GetAtt": ["MediaStorageCloudFront", "DomainName"],
						}
					]
				]
			},
			MEDIA_BUCKET_NAME: {
				Ref: "MediaStorage"
			},
		}
	},
	resources: resourcesProduct,
	functions: product,
};

const saleConfig = {
	service: "sale",
	plugins: [
		"serverless-webpack",
	],
	provider: {
		environment: {
			SALE_CREATED_TOPIC_ARN: {
				Ref: "SaleCreatedTopic"
			},
			PAYMENT_PROCESSED_TOPIC_ARN: {
				Ref: "PaymentProcessedTopic"
			},
		},
	},
	resources: resourcesSale,
	functions: sale,
};

const storeConfig = {
	service: "store",
	plugins: [
		"serverless-webpack",
	],
	provider: {
		environment: {
			UPLOAD_FROM_URL_QUEUE_URL: {
				"Fn::ImportValue": "upload-${opt:stage, 'local'}:UploadFromUrlQueueUrl",
			},
			STORE_CREATED_TOPIC_ARN: {
				Ref: "StoreCreatedTopic"
			},
			UPDATE_AVATAR_QUEUE_URL: {
				Ref: "UpdateAvatarQueue"
			},
			UPDATE_BANNER_QUEUE_URL: {
				Ref: "UpdateBannerQueue"
			},
			IMAGES_PREFIX_URL: {
				"Fn::Join": [
					"",
					[
						"https://",
						{
							"Fn::GetAtt": ["MediaStorageCloudFront", "DomainName"],
						}
					]
				]
			},
			MEDIA_BUCKET_NAME: {
				Ref: "MediaStorage"
			},
		}
	},
	resources: resourcesStore,
	functions: store,
};

const uploadConfig = {
	service: "upload",
	plugins: [
		"serverless-webpack",
	],
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
	plugins: [
		"serverless-webpack",
	],
	resources: resourcesWallet,
	functions: wallet,
};

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
