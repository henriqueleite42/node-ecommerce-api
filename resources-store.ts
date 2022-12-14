import type { AWS } from "@serverless/typescript";

const PROVISIONED_THROUGHPUT_STORES = {
	ReadCapacityUnits: 1,
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
					{
						AttributeName: "gender",
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
					{
						IndexName: "GenderStoreId",
						KeySchema: [
							{
								AttributeName: "gender",
								KeyType: "HASH",
							},
							{
								AttributeName: "storeId",
								KeyType: "RANGE",
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
		MediaStorageAvatarLambdaInvokePermission: {
			Type: "AWS::Lambda::Permission",
			Properties: {
				FunctionName: {
					"Fn::Sub": "arn:${AWS::Partition}:lambda:${AWS::Region}:${AWS::AccountId}:function:${AWS::StackName}-storeS3UpdateAvatar",
				},
				Action: "lambda:InvokeFunction",
				Principal: "s3.amazonaws.com",
				SourceAccount: {
					Ref: "AWS::AccountId",
				},
			},
		},
		MediaStorageBannerLambdaInvokePermission: {
			Type: "AWS::Lambda::Permission",
			Properties: {
				FunctionName: {
					"Fn::Sub": "arn:${AWS::Partition}:lambda:${AWS::Region}:${AWS::AccountId}:function:${AWS::StackName}-storeS3UpdateBanner",
				},
				Action: "lambda:InvokeFunction",
				Principal: "s3.amazonaws.com",
				SourceAccount: {
					Ref: "AWS::AccountId",
				},
			},
		},
		MediaStorage: {
			Type: "AWS::S3::Bucket",
			Properties: {
				BucketName: "monetizzer-${self:service}-${opt:stage, 'dev'}-media-storage",
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
									"arn:${AWS::Partition}:lambda:${AWS::Region}:${AWS::AccountId}:function:${AWS::StackName}-storeS3UpdateAvatar",
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
									"arn:${AWS::Partition}:lambda:${AWS::Region}:${AWS::AccountId}:function:${AWS::StackName}-storeS3UpdateBanner",
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
		IncrementStoresCountQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-increment-stores-count",
				ReceiveMessageWaitTimeSeconds: 20,
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
					"Ref": "StoreCreatedTopic",
				},
			},
		},
		IncrementSalesCountQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-increment-sales-count",
				ReceiveMessageWaitTimeSeconds: 20,
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
				ReceiveMessageWaitTimeSeconds: 20,
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
				ReceiveMessageWaitTimeSeconds: 20,
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
				ReceiveMessageWaitTimeSeconds: 20,
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
