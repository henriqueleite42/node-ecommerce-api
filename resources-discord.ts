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
			},
		},
		NewStoreAnnouncementQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-new-store-announcement",
			},
		},
		NewProductAnnouncementQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-new-product-announcement",
			},
		},

		NotifySellerCustomAutomaticProductsSaleQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-notify-seller-custom-automatic-products-sale",
			},
		},
		NotifySellerCustomManualProductsSaleQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-notify-seller-custom-manual-products-sale",
			},
		},
		NotifySellerPreMadeManualProductsSaleQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-notify-seller-pre-made-manual-products-sale",
			},
		},
		NotifySellerLiveManualProductsSaleQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-notify-seller-live-manual-products-sale",
			},
		},

		NotifyBuyerSalePaidQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-notify-buyer-sale-paid",
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
			},
		},

		NotifyAdminsToVerifyStoreQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-notify-admins-to-verify-store",
			},
		},
		NotifyAdminsToVerifyStoreSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["NotifyAdminsToVerifyStoreQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'local'}}",
				TopicArn: {
					"Fn::ImportValue": "store-${opt:stage, 'local'}:StoreCreatedTopicArn"
				},
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
