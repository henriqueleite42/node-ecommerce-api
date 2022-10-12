import type { AWS } from "@serverless/typescript";

const PROVISIONED_THROUGHPUT_SALES = {
	ReadCapacityUnits: 3,
	WriteCapacityUnits: 1,
};

export const resourcesSale: AWS["resources"] = {
	Resources: {
		SaleDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "sales",
				ProvisionedThroughput: PROVISIONED_THROUGHPUT_SALES,
				AttributeDefinitions: [
					{
						AttributeName: "saleId",
						AttributeType: "S",
					},
					{
						AttributeName: "storeId",
						AttributeType: "S",
					},
					{
						AttributeName: "createdAt_saleId",
						AttributeType: "S",
					},
					{
						AttributeName: "status_createdAt_saleId",
						AttributeType: "S",
					},
					{
						AttributeName: "clientId",
						AttributeType: "S",
					},
					{
						AttributeName: "storeId_clientId",
						AttributeType: "S",
					},
					{
						AttributeName: "status",
						AttributeType: "S",
					},
					{
						AttributeName: "expiresAt_saleId",
						AttributeType: "S",
					},
				],
				KeySchema: [
					{
						AttributeName: "saleId",
						KeyType: "HASH",
					},
				],
				GlobalSecondaryIndexes: [
					{
						IndexName: "StoreIdCreatedAtSaleId",
						KeySchema: [
							{
								AttributeName: "storeId",
								KeyType: "HASH",
							},
							{
								AttributeName: "createdAt_saleId",
								KeyType: "RANGE",
							},
						],
						Projection: {
							ProjectionType: "ALL"
						},
						ProvisionedThroughput: PROVISIONED_THROUGHPUT_SALES,
					},
					{
						IndexName: "StoreIdStatusCreatedAtSaleId",
						KeySchema: [
							{
								AttributeName: "storeId",
								KeyType: "HASH",
							},
							{
								AttributeName: "status_createdAt_saleId",
								KeyType: "RANGE",
							},
						],
						Projection: {
							ProjectionType: "ALL"
						},
						ProvisionedThroughput: PROVISIONED_THROUGHPUT_SALES,
					},
					{
						IndexName: "ClientIdCreatedAtSaleId",
						KeySchema: [
							{
								AttributeName: "clientId",
								KeyType: "HASH",
							},
							{
								AttributeName: "createdAt_saleId",
								KeyType: "RANGE",
							},
						],
						Projection: {
							ProjectionType: "ALL"
						},
						ProvisionedThroughput: PROVISIONED_THROUGHPUT_SALES,
					},
					{
						IndexName: "ClientIdStatusCreatedAtSaleId",
						KeySchema: [
							{
								AttributeName: "clientId",
								KeyType: "HASH",
							},
							{
								AttributeName: "status_createdAt_saleId",
								KeyType: "RANGE",
							},
						],
						Projection: {
							ProjectionType: "ALL"
						},
						ProvisionedThroughput: PROVISIONED_THROUGHPUT_SALES,
					},
					{
						IndexName: "StoreIdClientIdCreatedAtSaleId",
						KeySchema: [
							{
								AttributeName: "storeId_clientId",
								KeyType: "HASH",
							},
							{
								AttributeName: "createdAt_saleId",
								KeyType: "RANGE",
							},
						],
						Projection: {
							ProjectionType: "ALL"
						},
						ProvisionedThroughput: PROVISIONED_THROUGHPUT_SALES,
					},
					{
						IndexName: "StatusExpiresAtSaleId",
						KeySchema: [
							{
								AttributeName: "status",
								KeyType: "HASH",
							},
							{
								AttributeName: "expiresAt_saleId",
								KeyType: "RANGE",
							},
						],
						Projection: {
							ProjectionType: "ALL"
						},
						ProvisionedThroughput: PROVISIONED_THROUGHPUT_SALES,
					},
				],
			},
		},
		SaleCreatedTopic: {
			Type: "AWS::SNS::Topic",
			Properties: {
				TopicName: "${self:service}-${opt:stage, 'local'}-sale-created",
			},
		},
		SalePaidTopic: {
			Type: "AWS::SNS::Topic",
			Properties: {
				TopicName: "${self:service}-${opt:stage, 'local'}-sale-paid",
			},
		},
		SaleDeliveredTopic: {
			Type: "AWS::SNS::Topic",
			Properties: {
				TopicName: "${self:service}-${opt:stage, 'local'}-sale-delivered",
			},
		},
		SalesExpiredTopic: {
			Type: "AWS::SNS::Topic",
			Properties: {
				TopicName: "${self:service}-${opt:stage, 'local'}-sales-expired",
			},
		},
	},
	Outputs: {
		SaleCreatedTopicArn: {
			Value: {
				Ref: "SaleCreatedTopic"
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"SaleCreatedTopicArn",
						],
					],
				},
			}
		},
		SalePaidTopicArn: {
			Value: {
				Ref: "SalePaidTopic"
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"SalePaidTopicArn",
						],
					],
				},
			}
		},
		SaleDeliveredTopicArn: {
			Value: {
				Ref: "SaleDeliveredTopic"
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"SaleDeliveredTopicArn",
						],
					],
				},
			}
		},
		SalesExpiredTopicArn: {
			Value: {
				Ref: "SalesExpiredTopic"
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"SalesExpiredTopicArn",
						],
					],
				},
			}
		},
	}
};
