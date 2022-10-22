import type { AWS } from "@serverless/typescript";

const PROVISIONED_THROUGHPUT_SALES = {
	ReadCapacityUnits: 1,
	WriteCapacityUnits: 1,
};

export const resourcesSale: AWS["resources"] = {
	Resources: {
		/**
		 *
		 * Database
		 *
		 */
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
		/**
		 *
		 * Queues And Topics
		 *
		 */
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
		SaleDeliveryConfirmedTopic: {
			Type: "AWS::SNS::Topic",
			Properties: {
				TopicName: "${self:service}-${opt:stage, 'local'}-sale-delivery-confirmed",
			},
		},
		SalesExpiredTopic: {
			Type: "AWS::SNS::Topic",
			Properties: {
				TopicName: "${self:service}-${opt:stage, 'local'}-sales-expired",
			},
		},
		SaleRefundedTopic: {
			Type: "AWS::SNS::Topic",
			Properties: {
				TopicName: "${self:service}-${opt:stage, 'local'}-sales-refunded",
			},
		},
		HandleSaleDeliveryQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-handle-sale-delivery",
			},
		},
		HandleSaleDeliverySubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["HandleSaleDeliveryQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'local'}}",
				TopicArn: {
					Ref: "SalePaidTopic",
				},
			},
		},
		SetSaleProductAsDeliveredQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-setSaleProductAsDelivered",
			},
		},
		SetSaleProductAsDeliveredSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["SetSaleProductAsDeliveredQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'local'}}",
				TopicArn: {
					"Fn::ImportValue": "content-${opt:stage, 'local'}:AccessGrantedTopicArn"
				},
			},
		},
		NotifySellerSaleDeliveryConfirmedQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-notify-seller-sale-delivery-confirmed",
			},
		},
		NotifySellerSaleDeliveryConfirmedSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["NotifySellerSaleDeliveryConfirmedQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'local'}}",
				TopicArn: {
					Ref: "SalePaidTopic",
				},
			},
		},
	},
	Outputs: {
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
		SaleDeliveryConfirmedTopicArn: {
			Value: {
				Ref: "SaleDeliveryConfirmedTopic"
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"SaleDeliveryConfirmedTopicArn",
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
		SaleRefundedTopicArn: {
			Value: {
				Ref: "SaleRefundedTopic"
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"SaleRefundedTopicArn",
						],
					],
				},
			}
		},
	}
};
