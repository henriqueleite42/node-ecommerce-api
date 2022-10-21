import type { AWS } from "@serverless/typescript";

const PROVISIONED_THROUGHPUT_CONTENTS = {
	ReadCapacityUnits: 1,
	WriteCapacityUnits: 1,
};

const PROVISIONED_THROUGHPUT_ACCESSES_CONTENTS = {
	ReadCapacityUnits: 1,
	WriteCapacityUnits: 1,
};

const PROVISIONED_THROUGHPUT_ACCOUNT_ACCESSES_STORES = {
	ReadCapacityUnits: 1,
	WriteCapacityUnits: 1,
};

export const resourcesContent: AWS["resources"] = {
	Resources: {
		/**
		 *
		 * Database
		 *
		 */
		ContentDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "contents",
				ProvisionedThroughput: PROVISIONED_THROUGHPUT_CONTENTS,
				AttributeDefinitions: [
					{
						AttributeName: "storeId_productId_contentId",
						AttributeType: "S",
					},
					{
						AttributeName: "storeId_productId",
						AttributeType: "S",
					},
					{
						AttributeName: "createdAt_contentId",
						AttributeType: "S",
					},
				],
				KeySchema: [
					{
						AttributeName: "storeId_productId_contentId",
						KeyType: "HASH",
					},
				],
				GlobalSecondaryIndexes: [
					{
						IndexName: "StoreIdProductIdCreatedAtContentId",
						KeySchema: [
							{
								AttributeName: "storeId_productId",
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
						ProvisionedThroughput: PROVISIONED_THROUGHPUT_CONTENTS,
					},
				],
			},
		},
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
						IndexName: "AccountIdStoreIdProductIdCreatedAtContentId",
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
		 * Storage
		 *
		 */
		RawMediaStorageLambdaInvokePermission: {
			Type: "AWS::Lambda::Permission",
			Properties: {
				FunctionName: {
					"Fn::Sub": "arn:${AWS::Partition}:lambda:${AWS::Region}:${AWS::AccountId}:function:${AWS::StackName}-contentS3UpdateRawImg",
				},
				Action: "lambda:InvokeFunction",
				Principal: "s3.amazonaws.com",
				SourceAccount: {
					Ref: "AWS::AccountId",
				},
			},
		},
		RawMediaStorage: {
			Type: "AWS::S3::Bucket",
			Properties: {
				BucketName: "monetizzer-${self:service}-${opt:stage, 'dev'}-raw-media",
				PublicAccessBlockConfiguration: {
					BlockPublicAcls : true,
					BlockPublicPolicy : true,
					IgnorePublicAcls : true,
					RestrictPublicBuckets : true,
				},
				NotificationConfiguration: {
					LambdaConfigurations: [
						{
							Event: "s3:ObjectCreated:*",
							Function: {
								"Fn::Sub":
									"arn:${AWS::Partition}:lambda:${AWS::Region}:${AWS::AccountId}:function:${AWS::StackName}-contentS3UpdateRawImg",
							},
						},
					],
				},
				CorsConfiguration: {
					CorsRules: [
						{
							AllowedOrigins: ["*"],
							AllowedHeaders: ["*"],
							AllowedMethods: ["POST"],
							MaxAge: 3000,
						},
					],
				},
			},
		},
		/**
		 *
		 * Queues And Topics
		 *
		 */
		GiveBuyerAccessToSaleProductsQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-give-buyer-access-to-sale-products",
			},
		},
		AccessGrantedTopic: {
			Type: "AWS::SNS::Topic",
			Properties: {
				TopicName: "${self:service}-${opt:stage, 'local'}-access-granted",
			},
		},
		ContentCreatedTopic: {
			Type: "AWS::SNS::Topic",
			Properties: {
				TopicName: "${self:service}-${opt:stage, 'local'}-content-created",
			},
		},
	},
	Outputs: {
		RawMediaBucketName: {
			Value: {
				Ref: "RawMediaStorage"
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"RawMediaBucketName",
						],
					],
				},
			}
		},
		GiveBuyerAccessToSaleProductsUrl: {
			Value: {
				Ref: "GiveBuyerAccessToSaleProductsQueue"
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"GiveBuyerAccessToSaleProductsQueueUrl",
						],
					],
				},
			}
		},
		AccessGrantedTopicArn: {
			Value: {
				Ref: "AccessGrantedTopic"
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"AccessGrantedTopicArn",
						],
					],
				},
			}
		},
		ContentCreatedTopicArn: {
			Value: {
				Ref: "ContentCreatedTopic"
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"ContentCreatedTopicArn",
						],
					],
				},
			}
		},
	}
};
