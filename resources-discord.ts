import type { AWS } from "@serverless/typescript";

export const resourcesDiscord: AWS["resources"] = {
	Resources: {
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
					originPlatform: [{prefix:"DISCORD"}]
				},
			},
		},
		NotifySellerLiveProductsSaleQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-notify-seller-live-products-sale",
			},
		},
		NotifySellerCustomProductsSaleQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-notify-seller-custom-products-sale",
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
					originPlatform: [{prefix:"DISCORD"}]
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
					originPlatform: [{prefix:"DISCORD"}]
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
					originPlatform: [{prefix:"DISCORD"}]
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
