import type { AWS } from "@serverless/typescript";

const PROVISIONED_THROUGHPUT_STORES = {
	ReadCapacityUnits: 3,
	WriteCapacityUnits: 1,
};

export const resourcesStore: AWS["resources"] = {
	Resources: {
		/**
		 *
		 * Database
		 *
		 */
		StoreDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "stores",
				ProvisionedThroughput: PROVISIONED_THROUGHPUT_STORES,
				AttributeDefinitions: [
					{
						AttributeName: "storeId",
						AttributeType: "S",
					},
					{
						AttributeName: "name",
						AttributeType: "S",
					},
				],
				KeySchema: [
					{
						AttributeName: "storeId",
						KeyType: "HASH",
					},
				],
				GlobalSecondaryIndexes: [
					{
						IndexName: "Name",
						KeySchema: [
							{
								AttributeName: "name",
								KeyType: "HASH",
							},
						],
						Projection: {
							ProjectionType: "ALL"
						},
						ProvisionedThroughput: PROVISIONED_THROUGHPUT_STORES,
					},
				],
			},
		},
		/**
		 *
		 * Storage
		 *
		 */
		MediaStorage: {
			Type: "AWS::S3::Bucket",
			Properties: {
				BucketName: "monetizzer-${self:service}-${opt:stage, 'dev'}-media",
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
									"arn:${AWS::Partition}:lambda:${AWS::Region}:${AWS::AccountId}:function:${AWS::StackName}-update-avatar",
							},
							Filter: {
								S3Key: {
									Rules: [
										{
											Name: "prefix",
											Value: "avatars",
										},
									],
								},
							},
						},
						{
							Event: "s3:ObjectCreated:*",
							Function: {
								"Fn::Sub":
									"arn:${AWS::Partition}:lambda:${AWS::Region}:${AWS::AccountId}:function:${AWS::StackName}-update-banner",
							},
							Filter: {
								S3Key: {
									Rules: [
										{
											Name: "prefix",
											Value: "banners",
										},
									],
								},
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
		MediaStorageOriginAccessIdentity: {
			Type: "AWS::CloudFront::CloudFrontOriginAccessIdentity",
			Properties: {
				CloudFrontOriginAccessIdentityConfig: {
					Comment: {
						"Fn::Sub": "access-identity-${MediaStorage}",
					},
				},
			},
		},
		MediaStoragePolicy: {
			Type: "AWS::S3::BucketPolicy",
			Properties: {
				Bucket: {
					Ref: "MediaStorage",
				},
				PolicyDocument: {
					Version: "2012-10-17",
					Statement: [
						{
							Effect: "Allow",
							Principal: {
								CanonicalUser: {
									"Fn::GetAtt": ["MediaStorageOriginAccessIdentity", "S3CanonicalUserId"]
								},
							},
							Action: "s3:GetObject",
							Resource: {
								"Fn::Sub": "${MediaStorage.Arn}/*"
							}
						}
					]
				}
			},
		},
		MediaStorageCloudFront: {
			Type: "AWS::CloudFront::Distribution",
			Properties: {
				DistributionConfig: {
					Origins: [
						{
							DomainName: {
								"Fn::Sub": "${MediaStorage}.s3.${AWS::Region}.amazonaws.com",
							},
							Id: "storeMediaS3Origin",
							S3OriginConfig: {
								OriginAccessIdentity: {
									"Fn::Sub":
										"origin-access-identity/cloudfront/${MediaStorageOriginAccessIdentity}",
								},
							},
						},
					],
					Enabled: true,
					DefaultCacheBehavior: {
						AllowedMethods: ["GET", "HEAD"],
						Compress: true,
						MaxTTL: 0,
						MinTTL: 0,
						ViewerProtocolPolicy: "redirect-to-https",
						DefaultTTL: 0,
						TargetOriginId: "storeMediaS3Origin",
						ForwardedValues: {
							QueryString: false,
							Cookies: {
								Forward: "none",
							},
							Headers: [
								"Origin",
								"Access-Control-Request-Method",
								"Access-Control-Request-Headers",
							],
						},
					},
					PriceClass: "PriceClass_100",
					ViewerCertificate: {
						CloudFrontDefaultCertificate: true,
					},
				},
			},
			Metadata: {
				cfn_nag: {
					rules_to_suppress: [
						{
							id: "W70",
							reason:
								"CloudFront automatically sets the security policy to TLSv1 when the distribution uses the CloudFront domain name (CloudFrontDefaultCertificate=true)",
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
		StoreCreatedTopic: {
			Type: "AWS::SNS::Topic",
			Properties: {
				TopicName: "${self:service}-${opt:stage, 'local'}-store-created",
			},
		},
		StoreVerifiedTopic: {
			Type: "AWS::SNS::Topic",
			Properties: {
				TopicName: "${self:service}-${opt:stage, 'local'}-store-verified",
			},
		},
		IncrementStoresCountQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-increment-stores-count",
			},
		},
		IncrementStoresCountSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["IncrementStoresCountQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'local'}}",
				TopicArn: {
					"Fn::ImportValue": "sale-${opt:stage, 'local'}:SaleCreatedTopicArn",
				},
			},
		},
		IncrementSalesCountQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-increment-sales-count",
			},
		},
		IncrementSalesCountSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["IncrementSalesCountQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'local'}}",
				TopicArn: {
					"Fn::ImportValue": "sale-${opt:stage, 'local'}:SalePaidTopicArn"
				},
			},
		},
		IncrementTotalBilledQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-increment-total-billed",
			},
		},
		IncrementTotalBilledSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["IncrementTotalBilledQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'local'}}",
				TopicArn: {
					"Fn::ImportValue": "sale-${opt:stage, 'local'}:SalePaidTopicArn"
				},
			},
		},
		AddProductTypeQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-add-product-type",
			},
		},
		AddProductTypeSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["AddProductTypeQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'local'}}",
				TopicArn: {
					"Fn::ImportValue": "product-${opt:stage, 'local'}:ProductCreatedTopicArn"
				},
			},
		},
		RemoveProductTypeQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-remove-product-type",
			},
		},
		RemoveProductTypeSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["RemoveProductTypeQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'local'}}",
				TopicArn: {
					"Fn::ImportValue": "product-${opt:stage, 'local'}:ProductDeletedTopicArn"
				},
			},
		},
	},
	Outputs: {
		StoreCreatedTopicArn: {
			Value: {
				Ref: "StoreCreatedTopic"
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"StoreCreatedTopicArn",
						],
					],
				},
			}
		},
		StoreVerifiedTopicArn: {
			Value: {
				Ref: "StoreVerifiedTopic"
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"StoreVerifiedTopicArn",
						],
					],
				},
			}
		},
		MediaBucketName: {
			Value: {
				Ref: "MediaStorage"
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"MediaBucketName",
						],
					],
				},
			}
		},
		MediaStorageCloudfrontUrl: {
			Description: "CloudFront Products",
			Value: {
				"Fn::GetAtt": ["MediaStorageCloudFront", "DomainName"],
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"MediaStorageCloudfrontUrl",
						],
					],
				},
			},
		},
	}
};
