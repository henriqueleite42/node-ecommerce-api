import type { AWS } from "@serverless/typescript";

const PROVISIONED_THROUGHPUT_WALLETS = {
	ReadCapacityUnits: 3,
	WriteCapacityUnits: 1,
};

export const resourcesWallet: AWS["resources"] = {
	Resources: {
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
		CreateWalletQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-create-wallet",
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
		IncrementBalanceQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-increment-balance",
			},
		},
		IncrementBalanceSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["IncrementBalanceQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'local'}}",
				TopicArn: {
					"Fn::ImportValue": "sale-${opt:stage, 'local'}:PaymentProcessedTopicArn"
				},
			},
		},
	},
};
