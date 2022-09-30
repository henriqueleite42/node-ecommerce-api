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
	}
};
