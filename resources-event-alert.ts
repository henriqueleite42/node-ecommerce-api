import type { AWS } from "@serverless/typescript";

const PROVISIONED_THROUGHPUT_EVENTS_ALERTS = {
	ReadCapacityUnits: 5,
	WriteCapacityUnits: 1,
};

export const resourcesEventAlert: AWS["resources"] = {
	Resources: {
		/**
		 *
		 * Database
		 *
		 */
		EventAlertDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "events_alerts",
				ProvisionedThroughput: PROVISIONED_THROUGHPUT_EVENTS_ALERTS,
				AttributeDefinitions: [
					{
						AttributeName: "pk",
						AttributeType: "S",
					},
					{
						AttributeName: "sk",
						AttributeType: "S",
					},
					{
						AttributeName: "platform_discordGuildId",
						AttributeType: "S",
					},
					{
						AttributeName: "discordChannelId_alertType_storeId_productType",
						AttributeType: "S",
					},
				],
				KeySchema: [
					{
						AttributeName: "pk",
						KeyType: "HASH",
					},
					{
						AttributeName: "sk",
						KeyType: "RANGE",
					},
				],
				GlobalSecondaryIndexes: [
					{
						IndexName: "PlatformDiscordGuildIdDiscordChannelIdAlertTypeStoreIdProductType",
						KeySchema: [
							{
								AttributeName: "platform_discordGuildId",
								KeyType: "HASH",
							},
							{
								AttributeName: "discordChannelId_alertType_storeId_productType",
								KeyType: "RANGE",
							},
						],
						Projection: {
							ProjectionType: "ALL"
						},
						ProvisionedThroughput: PROVISIONED_THROUGHPUT_EVENTS_ALERTS,
					},
				],
			},
		},
		/**
		 *
		 * Queues And Topics
		 *
		 */
		DiscordNewProductEventQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-discord-new-product-event",
			},
		},
		DiscordNewProductEventSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["DiscordNewProductEventQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'local'}}",
				TopicArn: {
					"Fn::ImportValue": "product-${opt:stage, 'local'}:ProductCreatedTopicArn"
				},
			},
		},
		DiscordNewSaleEventQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-discord-new-sale-event",
			},
		},
		DiscordNewSaleEventSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["DiscordNewSaleEventQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'local'}}",
				TopicArn: {
					"Fn::ImportValue": "sale-${opt:stage, 'local'}:SaleCreatedTopicArn"
				},
			},
		},
		DiscordNewStoreEventQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-discord-new-store-event",
			},
		},
		DiscordNewStoreEventSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["DiscordNewStoreEventQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'local'}}",
				TopicArn: {
					"Fn::ImportValue": "store-${opt:stage, 'local'}:StoreVerifiedTopicArn"
				},
			},
		},
	},
};
