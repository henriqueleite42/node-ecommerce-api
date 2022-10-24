import type { AWS } from "@serverless/typescript";

const PROVISIONED_THROUGHPUT_WALLETS = {
	ReadCapacityUnits: 1,
	WriteCapacityUnits: 1,
};

export const resourcesWallet: AWS["resources"] = {
	Resources: {
		/**
		 *
		 * Database
		 *
		 */
		WalletDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "wallets",
				ProvisionedThroughput: PROVISIONED_THROUGHPUT_WALLETS,
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
		/**
		 *
		 * Queues And Topics
		 *
		 */
		CreateWalletQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-create-wallet",
				ReceiveMessageWaitTimeSeconds: 20,
			},
		},
		CreateWalletSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["CreateWalletQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'local'}}",
				TopicArn: {
					"Fn::ImportValue": "store-${opt:stage, 'local'}:StoreCreatedTopicArn"
				},
			},
		},
		DecreasePendingBalanceQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-decrease-pending-balance",
				ReceiveMessageWaitTimeSeconds: 20,
			},
		},
		DecreasePendingBalanceSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["DecreasePendingBalanceQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'local'}}",
				TopicArn: {
					"Fn::ImportValue": "sale-${opt:stage, 'local'}:SaleRefundedTopicArn"
				},
			},
		},
		IncrementPendingBalanceQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-increment-pending-balance",
				ReceiveMessageWaitTimeSeconds: 20,
			},
		},
		IncrementPendingBalanceSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["IncrementPendingBalanceQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'local'}}",
				TopicArn: {
					"Fn::ImportValue": "sale-${opt:stage, 'local'}:SaleDeliveredTopicArn"
				},
			},
		},
		ReleasePendingBalanceQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-release-pending-balance",
				ReceiveMessageWaitTimeSeconds: 20,
			},
		},
		ReleasePendingBalanceSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["ReleasePendingBalanceQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'local'}}",
				TopicArn: {
					"Fn::ImportValue": "sale-${opt:stage, 'local'}:SaleDeliveryConfirmedTopicArn"
				},
			},
		},
	},
};
