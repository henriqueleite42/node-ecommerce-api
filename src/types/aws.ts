/* eslint-disable @typescript-eslint/naming-convention */

import type {
	AwsCfFunction,
	AwsCfIf,
	AwsArn,
	AwsCfInstruction,
	AwsArnString,
	FunctionName,
	AwsSecretsManagerArnString,
	AwsCfImport,
	AwsCfRef,
	AwsAlbListenerArn,
	AwsAlexaEventToken,
	AwsLogGroupName,
	AwsLambdaArchitecture,
	AwsKmsArn,
	AwsResourceCondition,
	AwsResourceDependsOn,
	AwsLambdaEnvironment,
	AwsCfGetAtt,
	AwsCfJoin,
	EcrImageUri,
	AwsLambdaLayers,
	AwsLambdaMemorySize,
	AwsLambdaRole,
	AwsLambdaRuntime,
	AwsResourceTags,
	AwsLambdaTimeout,
	AwsLambdaTracing,
	AwsLambdaVersioning,
	AwsLambdaVpcConfig,
	AwsHttpApiPayload,
} from "@serverless/typescript";

export interface Lambda {
	name?: string;
	lambdaAtEdge?: {
		distribution: string;
		eventType:
			| "origin-request"
			| "origin-response"
			| "viewer-request"
			| "viewer-response";
		pathPattern?: string;
	};
	events?: Array<
		| {
				__schemaWorkaround__: null;
		  }
		| {
				activemq: {
					arn: AwsCfImport | AwsCfRef | string;
					basicAuthArn: AwsCfImport | AwsCfRef | AwsSecretsManagerArnString;
					batchSize?: number;
					enabled?: boolean;
					queue: string;
				};
		  }
		| {
				alb: {
					authorizer?: Array<string>;
					conditions: {
						header?: {
							name: string;
							values: Array<string>;
						};
						host?: Array<string>;
						ip?: Array<string | string>;
						method?: Array<string>;
						path?: Array<string>;
						query?: Record<string, string>;
					};
					healthCheck?:
						| boolean
						| {
								healthyThresholdCount?: number;
								intervalSeconds?: number;
								matcher?: {
									httpCode?: string;
								};
								path?: string;
								timeoutSeconds?: number;
								unhealthyThresholdCount?: number;
						  };
					listenerArn: AwsAlbListenerArn | AwsCfRef;
					multiValueHeaders?: boolean;
					priority: number;
					targetGroupName?: string;
				};
		  }
		| {
				alexaSkill:
					| AwsAlexaEventToken
					| {
							appId: AwsAlexaEventToken;
							enabled?: boolean;
					  };
		  }
		| {
				alexaSmartHome:
					| AwsAlexaEventToken
					| {
							appId: AwsAlexaEventToken;
							enabled?: boolean;
					  };
		  }
		| {
				cloudFront: {
					behavior?: {
						AllowedMethods?:
							| Array<
									| "DELETE"
									| "GET"
									| "HEAD"
									| "OPTIONS"
									| "PATCH"
									| "POST"
									| "PUT"
							  >
							| Array<"GET" | "HEAD" | "OPTIONS">
							| Array<"GET" | "HEAD">;
						CachedMethods?:
							| Array<"GET" | "HEAD" | "OPTIONS">
							| Array<"GET" | "HEAD">;
						ForwardedValues?: {
							Cookies?:
								| {
										Forward: "all" | "none";
								  }
								| {
										Forward: "whitelist";
										WhitelistedNames: Array<string>;
								  };
							Headers?: Array<string>;
							QueryString: boolean;
							QueryStringCacheKeys?: Array<string>;
						};
						CachePolicyId?: string;
						Compress?: boolean;
						FieldLevelEncryptionId?: string;
						OriginRequestPolicyId?: string;
						SmoothStreaming?: boolean;
						TrustedSigners?: Array<string>;
						ViewerProtocolPolicy?:
							| "allow-all"
							| "https-only"
							| "redirect-to-https";
						TrustedKeyGroups?: Array<AwsCfRef | string>;
					};
					cachePolicy?: Record<string, unknown> | Record<string, unknown>;
					eventType?:
						| "origin-request"
						| "origin-response"
						| "viewer-request"
						| "viewer-response";
					isDefaultOrigin?: boolean;
					includeBody?: boolean;
					origin?: string | (Record<string, unknown> | Record<string, unknown>);
					pathPattern?: string;
				};
		  }
		| {
				cloudwatchEvent: {
					event?: Record<string, unknown>;
					input?: Record<string, unknown> | string;
					inputPath?: string;
					inputTransformer?: {
						inputPathsMap?: Record<string, string>;
						inputTemplate: string;
					};
					description?: string;
					name?: string;
					enabled?: boolean;
				};
		  }
		| {
				cloudwatchLog:
					| AwsLogGroupName
					| {
							logGroup: AwsLogGroupName;
							filter?: string;
					  };
		  }
		| {
				cognitoUserPool: {
					pool: string;
					trigger:
						| "CreateAuthChallenge"
						| "CustomMessage"
						| "DefineAuthChallenge"
						| "PostAuthentication"
						| "PostConfirmation"
						| "PreAuthentication"
						| "PreSignUp"
						| "PreTokenGeneration"
						| "UserMigration"
						| "VerifyAuthChallengeResponse";
					existing?: boolean;
				};
		  }
		| {
				eventBridge: Record<string, unknown> | Record<string, unknown>;
		  }
		| {
				http:
					| string
					| {
							async?: boolean;
							authorizer?:
								| string
								| {
										arn?: AwsArn;
										authorizerId?: AwsCfInstruction;
										claims?: Array<string>;
										identitySource?: string;
										identityValidationExpression?: string;
										managedExternally?: boolean;
										name?: string;
										resultTtlInSeconds?: number;
										scopes?: Array<string>;
										type?: string | string | string | string;
								  };
							connectionId?: AwsCfInstruction;
							connectionType?: string | string;
							cors?:
								| boolean
								| {
										allowCredentials?: boolean;
										cacheControl?: string;
										headers?: Array<string>;
										maxAge?: number;
										methods?: Array<
											| "ANY"
											| "DELETE"
											| "GET"
											| "HEAD"
											| "OPTIONS"
											| "PATCH"
											| "POST"
											| "PUT"
										>;
										origin?: string;
										origins?: Array<string>;
								  };
							integration?:
								| string
								| string
								| string
								| string
								| string
								| string
								| string
								| string
								| string
								| string;
							method: string;
							operationId?: string;
							path: string;
							private?: boolean;
							request?: {
								contentHandling?: "CONVERT_TO_BINARY" | "CONVERT_TO_TEXT";
								method?: string;
								parameters?: {
									querystrings?: Record<
										string,
										| boolean
										| {
												required?: boolean;
												mappedValue?: AwsCfInstruction;
										  }
									>;
									headers?: Record<
										string,
										| boolean
										| {
												required?: boolean;
												mappedValue?: AwsCfInstruction;
										  }
									>;
									paths?: Record<
										string,
										| boolean
										| {
												required?: boolean;
												mappedValue?: AwsCfInstruction;
										  }
									>;
								};
								passThrough?: "NEVER" | "WHEN_NO_MATCH" | "WHEN_NO_TEMPLATES";
								schema?: Record<string, Record<string, unknown> | string>;
								schemas?: Record<string, Record<string, unknown> | string>;
								template?: Record<string, string>;
								uri?: AwsCfInstruction;
							};
							response?: {
								contentHandling?: "CONVERT_TO_BINARY" | "CONVERT_TO_TEXT";
								headers?: Record<string, string>;
								template?: string;
								statusCodes?: Record<
									string,
									{
										headers?: Record<string, string>;
										pattern?: string;
										template?: Record<string, string> | string;
									}
								>;
							};
					  };
		  }
		| {
				httpApi:
					| string
					| {
							authorizer?:
								| string
								| (
										| Record<string, unknown>
										| Record<string, unknown>
										| Record<string, unknown>
								  );
							method?: string;
							path: string;
					  };
		  }
		| {
				iot: {
					sql: string;
					sqlVersion?: "2015-10-08" | "2016-03-23" | "beta";
					name?: string;
					enabled?: boolean;
					description?: string;
				};
		  }
		| {
				iotFleetProvisioning: {
					enabled?: boolean;
					provisioningRoleArn: AwsArn;
					templateBody: Record<string, unknown>;
					templateName?: string;
				};
		  }
		| {
				kafka: {
					accessConfigurations: {
						vpcSubnet?: Array<string>;
						vpcSecurityGroup?: Array<string>;
						saslPlainAuth?: Array<AwsSecretsManagerArnString>;
						saslScram256Auth?: Array<AwsSecretsManagerArnString>;
						saslScram512Auth?: Array<AwsSecretsManagerArnString>;
					};
					batchSize?: number;
					enabled?: boolean;
					bootstrapServers: Array<string>;
					startingPosition?: "LATEST" | "TRIM_HORIZON";
					topic: string;
				};
		  }
		| {
				msk: {
					arn: AwsArnString | AwsCfImport | AwsCfRef;
					batchSize?: number;
					enabled?: boolean;
					startingPosition?: "LATEST" | "TRIM_HORIZON";
					topic: string;
				};
		  }
		| {
				rabbitmq: {
					arn: AwsCfImport | AwsCfRef | string;
					basicAuthArn: AwsCfImport | AwsCfRef | AwsSecretsManagerArnString;
					batchSize?: number;
					enabled?: boolean;
					queue: string;
				};
		  }
		| {
				s3:
					| string
					| {
							bucket: AwsCfFunction | AwsCfIf | string;
							event?: string;
							existing?: boolean;
							rules?: Array<{
								prefix?: string;
								suffix?: string;
							}>;
					  };
		  }
		| {
				schedule:
					| string
					| {
							rate: Array<string>;
							enabled?: boolean;
							name?: string;
							description?: string;
							input?:
								| string
								| (
										| Record<string, unknown>
										| {
												body: string;
										  }
								  );
							inputPath?: string;
							inputTransformer?: {
								inputTemplate: string;
								inputPathsMap?: Record<string, unknown>;
							};
					  };
		  }
		| {
				sns:
					| AwsArnString
					| Record<string, unknown>
					| Record<string, unknown>
					| string;
		  }
		| {
				sqs:
					| AwsArn
					| {
							arn: AwsArn;
							batchSize?: number;
							enabled?: boolean;
							maximumBatchingWindow?: number;
							functionResponseType?: "ReportBatchItemFailures";
					  };
		  }
		| {
				stream:
					| AwsArnString
					| (
							| {
									arn: AwsArnString;
									[k: string]: unknown;
							  }
							| {
									arn: AwsCfFunction;
									[k: string]: unknown;
							  }
					  );
		  }
		| {
				websocket:
					| string
					| {
							route: string;
							routeResponseSelectionExpression?: "$default";
							authorizer?:
								| AwsArnString
								| FunctionName
								| (Record<string, unknown> | Record<string, unknown>);
					  };
		  }
	>;
	architecture?: AwsLambdaArchitecture;
	awsKmsKeyArn?: AwsKmsArn;
	condition?: AwsResourceCondition;
	dependsOn?: AwsResourceDependsOn;
	description?: string;
	destinations?: {
		onSuccess?: string;
		onFailure?: string;
	};
	disableLogs?: boolean;
	environment?: AwsLambdaEnvironment;
	fileSystemConfig?: {
		arn: AwsCfGetAtt | AwsCfImport | AwsCfJoin | string;
		localMountPath: string;
	};
	handler?: string;
	image?:
		| EcrImageUri
		| {
				name?: string;
				uri?: EcrImageUri;
				workingDirectory?: string;
				command?: Array<string>;
				entryPoint?: Array<string>;
		  };
	kmsKeyArn?: AwsKmsArn;
	layers?: AwsLambdaLayers;
	maximumEventAge?: number;
	maximumRetryAttempts?: number;
	memorySize?: AwsLambdaMemorySize;
	onError?: AwsCfFunction | string;
	package?: {
		artifact?: string;
		exclude?: Array<string>;
		include?: Array<string>;
		individually?: boolean;
		patterns?: Array<string>;
	};
	provisionedConcurrency?: number;
	reservedConcurrency?: AwsCfFunction | AwsCfIf | number;
	role?: AwsLambdaRole;
	runtime?: AwsLambdaRuntime;
	tags?: AwsResourceTags;
	timeout?: AwsLambdaTimeout;
	tracing?: AwsLambdaTracing;
	versionFunction?: AwsLambdaVersioning;
	vpc?: AwsLambdaVpcConfig;
	httpApi?: {
		payload?: AwsHttpApiPayload;
	};
}
