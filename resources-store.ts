import type { AWS } from "@serverless/typescript";

export const resourcesStore: AWS["resources"] = {
	Resources: {
		StoreDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "stores",
				BillingMode: "PROVISIONED",
				ProvisionedThroughput: {
					ReadCapacityUnits: 3,
					WriteCapacityUnits: 1,
				},
				AttributeDefinitions: [
					{
						AttributeName: "storeId_productId",
						AttributeType: "S",
					},
					{
						AttributeName: "storeId",
						AttributeType: "S",
					},
					{
						AttributeName: "createdAt_productId",
						AttributeType: "S",
					},
					{
						AttributeName: "storeId_type",
						AttributeType: "S",
					},
				],
				KeySchema: [
					{
						AttributeName: "storeId_productId",
						KeyType: "HASH",
					},
				],
				GlobalSecondaryIndexes: [
					{
						IndexName: "StoreIdCreatedAtProductId",
						KeySchema: [
							{
								AttributeName: "storeId",
								KeyType: "HASH",
							},
							{
								AttributeName: "createdAt_productId",
								KeyType: "SORT",
							},
						],
					},
					{
						IndexName: "StoreIdTypeCreatedAtProductId",
						KeySchema: [
							{
								AttributeName: "storeId_type",
								KeyType: "HASH",
							},
							{
								AttributeName: "createdAt_productId",
								KeyType: "SORT",
							},
						],
					}
				],
			},
		},
		StoreCreatedTopic: {
			Type: "AWS::SNS::Topic",
			Properties: {
				TopicName: "${self:service}-${opt:stage, 'dev'}-store-created",
			},
		},
		IncrementStoresCountQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'dev'}-increment-stores-count",
			},
		},
		IncrementStoresCountSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["IncrementStoresCountQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'dev'}}",
				TopicArn: {
					Ref: "SaleCreatedTopic"
				},
			},
		},
		IncrementSalesCountQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'dev'}-increment-sales-count",
			},
		},
		IncrementSalesCountSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["IncrementSalesCountQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'dev'}}",
				TopicArn: {
					"Fn::ImportValue": "sale-${opt:stage, 'dev'}:PaymentProcessedTopicArn"
				},
			},
		},
		IncrementTotalBilledQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'dev'}-increment-total-billed",
			},
		},
		IncrementTotalBilledSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["IncrementTotalBilledQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'dev'}}",
				TopicArn: {
					"Fn::ImportValue": "sale-${opt:stage, 'dev'}:PaymentProcessedTopicArn"
				},
			},
		},
	},
	Outputs: {
		StoreCreatedTopicArn: {
			Value: {
				Ref: "StoreCreatedTopic"
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"StoreCreatedTopicArn",
						],
					],
				},
			}
		}
	}
};
