import type { AWS } from "@serverless/typescript";

export const resourcesAccess: AWS["resources"] = {
	Resources: {
		AccountDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "accesses",
				BillingMode: "PROVISIONED",
				ProvisionedThroughput: {
					ReadCapacityUnits: 3,
					WriteCapacityUnits: 1,
				},
				AttributeDefinitions: [
					{
						AttributeName: "accountId_storeId_productId_variationId",
						AttributeType: "S",
					},
					{
						AttributeName: "createdAt",
						AttributeType: "S",
					},
					{
						AttributeName: "accountId_storeId",
						AttributeType: "S",
					},
					{
						AttributeName: "createdAt_productId_variationId",
						AttributeType: "S",
					},
				],
				KeySchema: [
					{
						AttributeName: "accountId_storeId_productId_variationId",
						KeyType: "HASH",
					},
					{
						AttributeName: "createdAt",
						KeyType: "SORT",
					},
				],
				GlobalSecondaryIndexes: [
					{
						IndexName: "AccountIdStoreIdCreatedAtProductIdVariationId",
						KeySchema: [
							{
								AttributeName: "accountId_storeId",
								KeyType: "HASH",
							},
							{
								AttributeName: "createdAt_productId_variationId",
								KeyType: "SORT",
							},
						],
					},
				],
			},
		},
	},
};
