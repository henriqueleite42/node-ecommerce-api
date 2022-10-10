import type { AWS } from "@serverless/typescript";

const PROVISIONED_THROUGHPUT_CONTENTS = {
	ReadCapacityUnits: 3,
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
		/**
		 *
		 * Storage
		 *
		 */
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
									"arn:${AWS::Partition}:lambda:${AWS::Region}:${AWS::AccountId}:function:${AWS::StackName}-update-raw-img",
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
	}
};
