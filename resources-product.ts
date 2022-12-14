import type { AWS } from "@serverless/typescript";

const PROVISIONED_THROUGHPUT_PRODUCTS = {
	ReadCapacityUnits: 1,
	WriteCapacityUnits: 1,
};

export const resourcesProduct: AWS["resources"] = {
	Resources: {
		/**
		 *
		 * Database
		 *
		 */
		ProductDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "products",
				ProvisionedThroughput: PROVISIONED_THROUGHPUT_PRODUCTS,
				AttributeDefinitions: [
					{
						AttributeName: "storeId_productId",
						AttributeType: "S",
					},
					{
						AttributeName: "storeId",
						AttributeType: "S",
					},
					{
						AttributeName: "createdAt_productId",
						AttributeType: "S",
					},
					{
						AttributeName: "storeId_type",
						AttributeType: "S",
					},
				],
				KeySchema: [
					{
						AttributeName: "storeId_productId",
						KeyType: "HASH",
					},
				],
				GlobalSecondaryIndexes: [
					{
						IndexName: "StoreIdCreatedAtProductId",
						KeySchema: [
							{
								AttributeName: "storeId",
								KeyType: "HASH",
							},
							{
								AttributeName: "createdAt_productId",
								KeyType: "RANGE",
							},
						],
						Projection: {
							ProjectionType: "ALL"
						},
						ProvisionedThroughput: PROVISIONED_THROUGHPUT_PRODUCTS,
					},
					{
						IndexName: "StoreIdTypeCreatedAtProductId",
						KeySchema: [
							{
								AttributeName: "storeId_type",
								KeyType: "HASH",
							},
							{
								AttributeName: "createdAt_productId",
								KeyType: "RANGE",
							},
						],
						Projection: {
							ProjectionType: "ALL"
						},
						ProvisionedThroughput: PROVISIONED_THROUGHPUT_PRODUCTS,
					},
				],
			},
		},
		/**
		 *
		 * Storage
		 *
		 */
		MediaStorageLambdaInvokePermission: {
			Type: "AWS::Lambda::Permission",
			Properties: {
				FunctionName: {
					"Fn::Sub": "arn:${AWS::Partition}:lambda:${AWS::Region}:${AWS::AccountId}:function:${AWS::StackName}-productS3UpdateImg",
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
									"arn:${AWS::Partition}:lambda:${AWS::Region}:${AWS::AccountId}:function:${AWS::StackName}-productS3UpdateImg",
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
							Id: "productMediaS3Origin",
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
						TargetOriginId: "productMediaS3Origin",
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
		DelayProductCreatedNotificationQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-delay-product-created-notification",
				ReceiveMessageWaitTimeSeconds: 20,
			},
		},
		ProductCreatedTopic: {
			Type: "AWS::SNS::Topic",
			Properties: {
				TopicName: "${self:service}-${opt:stage, 'local'}-product-created",
			},
		},
		ProductDeletedTopic: {
			Type: "AWS::SNS::Topic",
			Properties: {
				TopicName: "${self:service}-${opt:stage, 'local'}-product-deleted",
			},
		},
		IncrementProductsCountQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-increment-products-count",
				ReceiveMessageWaitTimeSeconds: 20,
			},
		},
		IncrementProductsCountSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["IncrementProductsCountQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'local'}}",
				TopicArn: {
					Ref: "ProductCreatedTopic",
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
		IncrementMediaCountQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-update-product-media-count",
				ReceiveMessageWaitTimeSeconds: 20,
			},
		},
		IncrementMediaCountSubscription: {
			Type: "AWS::SNS::Subscription",
			Properties: {
				Protocol: "sqs",
				Endpoint: {
					"Fn::GetAtt": ["IncrementMediaCountQueue", "Arn"],
				},
				Region: "${self:custom.region.${opt:stage, 'local'}}",
				TopicArn: {
					"Fn::ImportValue": "content-${opt:stage, 'local'}:ContentCreatedTopicArn"
				},
				FilterPolicy: {
					productType: ["PACK"]
				},
			},
		},
	},
	Outputs: {
		DelayProductCreatedNotificationQueueUrl:  {
			Value: {
				Ref: "DelayProductCreatedNotificationQueue"
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"DelayProductCreatedNotificationQueueUrl",
						],
					],
				},
			}
		},
		ProductCreatedTopicArn: {
			Value: {
				Ref: "ProductCreatedTopic"
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"ProductCreatedTopicArn",
						],
					],
				},
			}
		},
		ProductDeletedTopicArn: {
			Value: {
				Ref: "ProductDeletedTopic"
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"ProductDeletedTopicArn",
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
