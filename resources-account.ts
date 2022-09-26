import type { AWS } from "@serverless/typescript";

export const resourcesAccount: AWS["resources"] = {
	Resources: {
		AccountDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "accounts",
				ProvisionedThroughput: {
					ReadCapacityUnits: 3,
					WriteCapacityUnits: 1,
				},
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
						IndexName: "discordId",
						KeySchema: [
							{
								AttributeName: "discordId",
								KeyType: "HASH",
							},
						],
					}
				],
			},
		},
	},
};
