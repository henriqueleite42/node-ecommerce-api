import type { AWS } from "@serverless/typescript";

const PROVISIONED_THROUGHPUT_ACCOUNTS = {
	ReadCapacityUnits: 3,
	WriteCapacityUnits: 1,
};

const PROVISIONED_THROUGHPUT_REFRESH_TOKENS = {
	ReadCapacityUnits: 3,
	WriteCapacityUnits: 1,
};

const PROVISIONED_THROUGHPUT_MAGIC_LINKS = {
	ReadCapacityUnits: 3,
	WriteCapacityUnits: 1,
};

export const resourcesAccount: AWS["resources"] = {
	Resources: {
		AccountDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "accounts",
				ProvisionedThroughput: PROVISIONED_THROUGHPUT_ACCOUNTS,
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
						ProvisionedThroughput: PROVISIONED_THROUGHPUT_ACCOUNTS,
					}
				],
			},
		},
		RefreshTokenDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "refresh_tokens",
				ProvisionedThroughput: PROVISIONED_THROUGHPUT_REFRESH_TOKENS,
				AttributeDefinitions: [
					{
						AttributeName: "token",
						AttributeType: "S",
					},
					{
						AttributeName: "accountId",
						AttributeType: "S",
					},
				],
				KeySchema: [
					{
						AttributeName: "token",
						KeyType: "HASH",
					},
				],
				GlobalSecondaryIndexes: [
					{
						IndexName: "AccountId",
						KeySchema: [
							{
								AttributeName: "accountId",
								KeyType: "HASH",
							},
						],
						Projection: {
							ProjectionType: "ALL"
						},
						ProvisionedThroughput: PROVISIONED_THROUGHPUT_REFRESH_TOKENS,
					}
				],
			},
		},
		MagicLinkDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "magic_links",
				ProvisionedThroughput: PROVISIONED_THROUGHPUT_MAGIC_LINKS,
				TimeToLiveSpecification: {
					AttributeName: "ttl",
					Enabled: true,
				},
				AttributeDefinitions: [
					{
						AttributeName: "token",
						AttributeType: "S",
					},
					{
						AttributeName: "accountId",
						AttributeType: "S",
					},
					{
						AttributeName: "ttl",
						AttributeType: "N",
					},
				],
				KeySchema: [
					{
						AttributeName: "token",
						KeyType: "HASH",
					},
				],
				GlobalSecondaryIndexes: [
					{
						IndexName: "AccountId",
						KeySchema: [
							{
								AttributeName: "accountId",
								KeyType: "HASH",
							},
						],
						Projection: {
							ProjectionType: "ALL"
						},
						ProvisionedThroughput: PROVISIONED_THROUGHPUT_MAGIC_LINKS,
					}
				],
			},
		},
	},
};
