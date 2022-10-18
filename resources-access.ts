import type { AWS } from "@serverless/typescript";

const PROVISIONED_THROUGHPUT_ACCESSES_CONTENTS = {
	ReadCapacityUnits: 3,
	WriteCapacityUnits: 1,
};

const PROVISIONED_THROUGHPUT_ACCOUNT_ACCESSES_STORES = {
	ReadCapacityUnits: 3,
	WriteCapacityUnits: 1,
};

export const resourcesAccess: AWS["resources"] = {
	Resources: {
		/**
		 *
		 * Database
		 *
		 */
		AccessDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "accesses_contents",
				ProvisionedThroughput: PROVISIONED_THROUGHPUT_ACCESSES_CONTENTS,
				AttributeDefinitions: [
					{
						AttributeName: "pk",
						AttributeType: "S",
					},
					{
						AttributeName: "accountId_storeId",
						AttributeType: "S",
					},
					{
						AttributeName: "createdAt_productId_contentId",
						AttributeType: "S",
					},
					{
						AttributeName: "accountId_storeId_productId",
						AttributeType: "S",
					},
					{
						AttributeName: "createdAt_contentId",
						AttributeType: "S",
					},
					{
						AttributeName: "storeId_productId",
						AttributeType: "S",
					},
					{
						AttributeName: "createdAt_accountId_contentId",
						AttributeType: "S",
					},
				],
				KeySchema: [
					{
						AttributeName: "pk",
						KeyType: "HASH",
					},
				],
				GlobalSecondaryIndexes: [
					{
						IndexName: "AccountIdStoreIdCreatedAtProductIdContentId",
						KeySchema: [
							{
								AttributeName: "accountId_storeId",
								KeyType: "HASH",
							},
							{
								AttributeName: "createdAt_productId_contentId",
								KeyType: "RANGE",
							},
						],
						Projection: {
							ProjectionType: "ALL"
						},
						ProvisionedThroughput: PROVISIONED_THROUGHPUT_ACCESSES_CONTENTS,
					},
					{
						IndexName: "AccountIdStoreIdCreatedAtProductIdContentId",
						KeySchema: [
							{
								AttributeName: "accountId_storeId_productId",
								KeyType: "HASH",
							},
							{
								AttributeName: "createdAt_contentId",
								KeyType: "RANGE",
							},
						],
						Projection: {
							ProjectionType: "ALL"
						},
						ProvisionedThroughput: PROVISIONED_THROUGHPUT_ACCESSES_CONTENTS,
					},
					{
						IndexName: "StoreIdProductIdCreatedAtAccountIdContentId",
						KeySchema: [
							{
								AttributeName: "storeId_productId",
								KeyType: "HASH",
							},
							{
								AttributeName: "createdAt_accountId_contentId",
								KeyType: "RANGE",
							},
						],
						Projection: {
							ProjectionType: "ALL"
						},
						ProvisionedThroughput: PROVISIONED_THROUGHPUT_ACCESSES_CONTENTS,
					}
				],
			},
		},
		AccountAccessesStoresDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "account_accesses_stores",
				ProvisionedThroughput: PROVISIONED_THROUGHPUT_ACCOUNT_ACCESSES_STORES,
				AttributeDefinitions: [
					{
						AttributeName: "accountId",
						AttributeType: "S",
					},
					{
						AttributeName: "storeId",
						AttributeType: "S",
					},
					{
						AttributeName: "storeName_storeId",
						AttributeType: "S",
					},
					{
						AttributeName: "createdAt_storeName_storeId",
						AttributeType: "S",
					},
				],
				KeySchema: [
					{
						AttributeName: "accountId",
						KeyType: "HASH",
					},
					{
						AttributeName: "storeId",
						KeyType: "RANGE",
					},
				],
				GlobalSecondaryIndexes: [
					{
						IndexName: "AccountIdStoreNameStoreId",
						KeySchema: [
							{
								AttributeName: "accountId",
								KeyType: "HASH",
							},
							{
								AttributeName: "storeName_storeId",
								KeyType: "RANGE",
							},
						],
						Projection: {
							ProjectionType: "ALL"
						},
						ProvisionedThroughput: PROVISIONED_THROUGHPUT_ACCOUNT_ACCESSES_STORES,
					},
					{
						IndexName: "AccountIdCreatedAtStoreNameStoreId",
						KeySchema: [
							{
								AttributeName: "accountId",
								KeyType: "HASH",
							},
							{
								AttributeName: "createdAt_storeName_storeId",
								KeyType: "RANGE",
							},
						],
						Projection: {
							ProjectionType: "ALL"
						},
						ProvisionedThroughput: PROVISIONED_THROUGHPUT_ACCOUNT_ACCESSES_STORES,
					},
				],
			},
		},
		/**
		 *
		 * Queues And Topics
		 *
		 */
		GiveAccessAfterSaleQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-increment-products-count",
			},
		},
		GiveAccessAfterSaleSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["GiveAccessAfterSaleQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'local'}}",
				TopicArn: {
					"Fn::ImportValue": "sale-${opt:stage, 'local'}:SalePaidTopicArn"
				},
			},
		},
	},
};
