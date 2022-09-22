import type { AWS } from "@serverless/typescript";

export const resourcesWallet: AWS["resources"] = {
	Resources: {
		AccountDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "wallets",
				BillingMode: "PROVISIONED",
				ProvisionedThroughput: {
					ReadCapacityUnits: 3,
					WriteCapacityUnits: 1,
				},
				AttributeDefinitions: [
					{
						AttributeName: "accountId",
						AttributeType: "S",
					},
				],
				KeySchema: [
					{
						AttributeName: "accountId",
						KeyType: "HASH",
					},
				],
			},
		},
	},
};
