import type { AWS } from "@serverless/typescript";
import { merge } from "lodash";

import { resourcesAccount } from "./resources-account";
import { resourcesBlacklist } from "./resources-blacklist";
import { resourcesContent } from "./resources-content";
import { resourcesCounter } from "./resources-counter";
import { resourcesCoupon } from "./resources-coupon";
import { resourcesDiscord } from "./resources-discord";
import { resourcesEventAlert } from "./resources-event-alert";
import { resourcesFeedback } from "./resources-feedback";
import { resourcesProduct } from "./resources-product";
import { resourcesSale } from "./resources-sale";
import { resourcesStore } from "./resources-store";
import { resourcesWallet } from "./resources-wallet";

import { contentSQS } from "./src/delivery/queue/content";
import { discord } from "./src/delivery/queue/discord";
import { eventAlert } from "./src/delivery/queue/event-alert";
import { productSQS } from "./src/delivery/queue/product";
import { saleSQS } from "./src/delivery/queue/sale";
import { storeSQS } from "./src/delivery/queue/store";
import { wallet } from "./src/delivery/queue/wallet";

import { contentS3 } from "./src/delivery/s3/content";
import { productS3 } from "./src/delivery/s3/product";
import { storeS3 } from "./src/delivery/s3/store";

const baseConfig: Partial<AWS> = {
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
		webpack: {
			webpackConfig: "webpack.lambda.config.js"
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

const blacklistConfig = {
	service: "blacklist",
	resources: resourcesBlacklist,
};

const contentConfig = {
	service: "content",
	provider: {
		environment: {
			CONTENT_ACCESS_GRANTED_TOPIC_ARN: {
				Ref: "AccessGrantedTopic"
			},
		},
	},
	plugins: [
		"serverless-webpack",
	],
	resources: resourcesContent,
	functions: {
		...contentS3,
		...contentSQS
	},
};

const counterConfig = {
	service: "counter",
	resources: resourcesCounter,
};

const couponConfig = {
	service: "coupon",
	resources: resourcesCoupon,
};

const discordConfig = {
	service: "discord",
	plugins: [
		"serverless-webpack",
	],
	provider: {
		environment: {
			DISCORD_DISCORD_BOT_TOKEN: "${ssm:monetizzer-discordBotToken}",
			DISCORD_DISCORD_BOT_CLIENT_ID: "${ssm:monetizzer-discordBotClientId}",
			DISCORD_DISCORD_BOT_CLIENT_SECRET: "${ssm:monetizzer-discordBotClientSecret}",
			DISCORD_DISCORD_REDIRECT_URI: "${ssm:monetizzer-discordRedirectUri}",
		},
	},
	resources: resourcesDiscord,
	functions: discord,
};

const eventsAlertsConfig = {
	service: "event-alert",
	plugins: [
		"serverless-webpack",
	],
	provider: {
		environment: {
			DISCORD_NEW_SALE_ANNOUNCEMENT_QUEUE_URL: {
				"Fn::ImportValue":
					"discord-${opt:stage, 'local'}:NewSaleAnnouncementQueueUrl",
			},
			DISCORD_NEW_STORE_ANNOUNCEMENT_QUEUE_URL: {
				"Fn::ImportValue":
					"discord-${opt:stage, 'local'}:NewStoreAnnouncementQueueUrl",
			},
			DISCORD_NEW_PRODUCT_ANNOUNCEMENT_QUEUE_URL: {
				"Fn::ImportValue":
					"discord-${opt:stage, 'local'}:NewProductAnnouncementQueueUrl",
			},
		},
	},
	resources: resourcesEventAlert,
	functions: eventAlert,
};

const feedbackConfig = {
	service: "feedback",
	resources: resourcesFeedback,
};

const productConfig = {
	service: "product",
	provider: {
		environment: {
			PRODUCT_DELAY_PRODUCT_CREATION_NOTIFICATION_QUEUE_URL: {
				Ref: "DelayProductCreatedNotificationQueue"
			},
		},
	},
	plugins: [
		"serverless-webpack",
	],
	resources: resourcesProduct,
	functions: {
		...productSQS,
		...productS3
	},
};

const saleConfig = {
	service: "sale",
	provider: {
		environment: {
			CONTENT_GIVE_BUYER_ACCESS_TO_PRE_MADE_AUTOMATIC_SALE_PRODUCTS_QUEUE_URL: {
				"Fn::ImportValue":
					"content-${opt:stage, 'local'}:GiveBuyerAccessToPreMadeAutomaticSaleProductsQueueUrl",
			},
			DISCORD_NOTIFY_SELLER_CUSTOM_AUTOMATIC_PRODUCTS_SALE_QUEUE_URL: {
				"Fn::ImportValue":
					"discord-${opt:stage, 'local'}:NotifySellerCustomAutomaticProductsSaleQueueUrl",
			},
			DISCORD_NOTIFY_SELLER_PRE_MADE_MANUAL_PRODUCTS_SALE_QUEUE_URL: {
				"Fn::ImportValue":
					"discord-${opt:stage, 'local'}:NotifySellerPreMadeManualProductsSaleQueueUrl",
			},
			DISCORD_NOTIFY_SELLER_LIVE_MANUAL_PRODUCTS_SALE_QUEUE_URL: {
				"Fn::ImportValue":
					"discord-${opt:stage, 'local'}:NotifySellerPreMadeManualProductsSaleQueueUrl",
			},
		},
	},
	resources: resourcesSale,
	functions: saleSQS,
};

const storeConfig = {
	service: "store",
	plugins: [
		"serverless-webpack",
	],
	resources: resourcesStore,
	functions: {
		...storeSQS,
		...storeS3,
	},
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

		case "COUPON":
			return merge(baseConfig, couponConfig);

		case "DISCORD":
			return merge(baseConfig, discordConfig);

		case "EVENT-ALERT":
			return merge(baseConfig, eventsAlertsConfig);

		case "FEEDBACK":
			return merge(baseConfig, feedbackConfig);

		case "PRODUCT":
			return merge(baseConfig, productConfig);

		case "SALE":
			return merge(baseConfig, saleConfig);

		case "STORE":
			return merge(baseConfig, storeConfig);

		case "WALLET":
			return merge(baseConfig, walletConfig);

		default:
			throw new Error("Missing API_MODULE env var");
	}
};

const serverlessConfig = getConfig();

//@ts-ignore
export = serverlessConfig;
