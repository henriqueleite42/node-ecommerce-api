import type { AWS } from "@serverless/typescript";

const PROVISIONED_THROUGHPUT_DISCORDS = {
	ReadCapacityUnits: 1,
	WriteCapacityUnits: 1,
};

export const resourcesDiscord: AWS["resources"] = {
	Resources: {
		/**
		 *
		 * Database
		 *
		 */
		DiscordDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "discords",
				ProvisionedThroughput: PROVISIONED_THROUGHPUT_DISCORDS,
				AttributeDefinitions: [
					{
						AttributeName: "accountId",
						AttributeType: "S",
					},
					{
						AttributeName: "discordId",
						AttributeType: "S",
					},
				],
				KeySchema: [
					{
						AttributeName: "accountId",
						KeyType: "HASH",
					},
				],
				GlobalSecondaryIndexes: [
					{
						IndexName: "DiscordId",
						KeySchema: [
							{
								AttributeName: "discordId",
								KeyType: "HASH",
							},
						],
						Projection: {
							ProjectionType: "ALL"
						},
						ProvisionedThroughput: PROVISIONED_THROUGHPUT_DISCORDS,
					}
				],
			},
		},
		/**
		 *
		 * Queues And Topics
		 *
		 */
		NewSaleAnnouncementQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-new-sale-announcement",
				ReceiveMessageWaitTimeSeconds: 20,
			},
		},
		NewStoreAnnouncementQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-new-store-announcement",
				ReceiveMessageWaitTimeSeconds: 20,
			},
		},
		NewProductAnnouncementQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-new-product-announcement",
				ReceiveMessageWaitTimeSeconds: 20,
			},
		},

		NotifySellerCustomAutomaticProductsSaleQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-notify-seller-custom-automatic-products-sale",
				ReceiveMessageWaitTimeSeconds: 20,
			},
		},
		NotifySellerCustomManualProductsSaleQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-notify-seller-custom-manual-products-sale",
				ReceiveMessageWaitTimeSeconds: 20,
			},
		},
		NotifySellerPreMadeManualProductsSaleQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-notify-seller-pre-made-manual-products-sale",
				ReceiveMessageWaitTimeSeconds: 20,
			},
		},
		NotifySellerLiveManualProductsSaleQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-notify-seller-live-manual-products-sale",
				ReceiveMessageWaitTimeSeconds: 20,
			},
		},

		NotifyBuyerSalePaidQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-notify-buyer-sale-paid",
				ReceiveMessageWaitTimeSeconds: 20,
			},
		},
		NotifyBuyerSalePaidSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["NotifyBuyerSalePaidQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'local'}}",
				TopicArn: {
					"Fn::ImportValue": "sale-${opt:stage, 'local'}:SalePaidTopicArn"
				},
				FilterPolicy: {
					origin: [{prefix:"DISCORD"}]
				},
			},
		},
		NotifyBuyerAccessGrantedQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-notify-buyer-access-granted",
				ReceiveMessageWaitTimeSeconds: 20,
			},
		},
		NotifyBuyerAccessGrantedSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["NotifyBuyerAccessGrantedQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'local'}}",
				TopicArn: {
					"Fn::ImportValue": "content-${opt:stage, 'local'}:AccessGrantedTopicArn"
				},
				FilterPolicy: {
					origin: [{prefix:"DISCORD"}]
				},
			},
		},
		NotifyBuyerSaleDeliveredQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-notify-buyer-sale-delivered",
				ReceiveMessageWaitTimeSeconds: 20,
			},
		},
		NotifyBuyerSaleDeliveredSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["NotifyBuyerSaleDeliveredQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'local'}}",
				TopicArn: {
					"Fn::ImportValue": "sale-${opt:stage, 'local'}:SaleDeliveredTopicArn"
				},
				FilterPolicy: {
					origin: [{prefix:"DISCORD"}]
				},
			},
		},
		NotifyBuyerSaleDeliveryConfirmedQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-notify-buyer-sale-delivery-confirmed",
				ReceiveMessageWaitTimeSeconds: 20,
			},
		},
		NotifyBuyerSaleDeliveryConfirmedSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["NotifyBuyerSaleDeliveryConfirmedQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'local'}}",
				TopicArn: {
					"Fn::ImportValue": "sale-${opt:stage, 'local'}:SaleDeliveryConfirmedTopicArn"
				},
				FilterPolicy: {
					origin: [{prefix:"DISCORD"}]
				},
			},
		},
		NotifySellerSaleDeliveryConfirmedQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-notify-seller-sale-delivery-confirmed",
				ReceiveMessageWaitTimeSeconds: 20,
			},
		},
	},
	Outputs: {
		NewSaleAnnouncementQueueUrl: {
			Value: {
				Ref: "NewSaleAnnouncementQueue"
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"NewSaleAnnouncementQueueUrl",
						],
					],
				},
			}
		},
		NewStoreAnnouncementQueueUrl: {
			Value: {
				Ref: "NewStoreAnnouncementQueue"
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"NewStoreAnnouncementQueueUrl",
						],
					],
				},
			}
		},
		NewProductAnnouncementQueueUrl: {
			Value: {
				Ref: "NewProductAnnouncementQueue"
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"NewProductAnnouncementQueueUrl",
						],
					],
				},
			}
		},
		NotifyBuyerSalePaidQueueUrl: {
			Value: {
				Ref: "NotifyBuyerSalePaidQueue"
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"NotifyBuyerSalePaidQueueUrl",
						],
					],
				},
			}
		},
		NotifySellerLiveProductsSaleQueueUrl: {
			Value: {
				Ref: "NotifySellerLiveProductsSaleQueue"
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"NotifySellerLiveProductsSaleQueueUrl",
						],
					],
				},
			}
		},
		NotifySellerCustomProductsSaleQueueUrl: {
			Value: {
				Ref: "NotifySellerCustomProductsSaleQueue"
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"NotifySellerCustomProductsSaleQueueUrl",
						],
					],
				},
			}
		},
		NotifySellerSaleDeliveryConfirmedQueueUrl: {
			Value: {
				Ref: "NotifySellerSaleDeliveryConfirmedQueue"
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"NotifySellerSaleDeliveryConfirmedQueueUrl",
						],
					],
				},
			}
		},
	}
};
