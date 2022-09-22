import type { AWS } from "@serverless/typescript";

export const resourcesProduct: AWS["resources"] = {
	Resources: {
		AccountDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "products",
				BillingMode: "PROVISIONED",
				ProvisionedThroughput: {
					ReadCapacityUnits: 3,
					WriteCapacityUnits: 1,
				},
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
								KeyType: "SORT",
							},
						],
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
								KeyType: "SORT",
							},
						],
					},
				],
			},
		},
	},
};
