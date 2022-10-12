import type { AWS } from "@serverless/typescript";

const PROVISIONED_THROUGHPUT_ACCESSES = {
	ReadCapacityUnits: 3,
	WriteCapacityUnits: 1,
};

export const resourcesAccess: AWS["resources"] = {
	Resources: {
		AccessDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "accesses",
				ProvisionedThroughput: PROVISIONED_THROUGHPUT_ACCESSES,
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
						AttributeName: "createdAt_sk",
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
						IndexName: "AccountIdStoreIdCreatedAtSk",
						KeySchema: [
							{
								AttributeName: "accountId_storeId",
								KeyType: "HASH",
							},
							{
								AttributeName: "createdAt_sk",
								KeyType: "RANGE",
							},
						],
						Projection: {
							ProjectionType: "ALL"
						},
						ProvisionedThroughput: PROVISIONED_THROUGHPUT_ACCESSES,
					}
				],
			},
		},
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
