import type { AWS } from "@serverless/typescript";

export const resourcesWallet: AWS["resources"] = {
	Resources: {
		WalletDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "wallets",
				BillingMode: "PROVISIONED",
				ProvisionedThroughput: {
					ReadCapacityUnits: 3,
					WriteCapacityUnits: 1,
				},
				AttributeDefinitions: [
					{
						AttributeName: "accountId",
						AttributeType: "S",
					},
				],
				KeySchema: [
					{
						AttributeName: "accountId",
						KeyType: "HASH",
					},
				],
			},
		},
		CreateWalletQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'dev'}-create-wallet",
			},
		},
		CreateWalletSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["CreateWalletQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'dev'}}",
				TopicArn: {
					"Fn::ImportValue": "store-${opt:stage, 'dev'}:StoreCreatedTopicArn"
				},
			},
		},
		IncrementBalanceQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'dev'}-increment-balance",
			},
		},
		IncrementBalanceSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["IncrementBalanceQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'dev'}}",
				TopicArn: {
					"Fn::ImportValue": "sale-${opt:stage, 'dev'}:PaymentProcessedTopicArn"
				},
			},
		},
	},
};
