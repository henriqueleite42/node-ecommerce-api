import type { AWS } from "@serverless/typescript";

export const resourcesSale: AWS["resources"] = {
	Resources: {
		AccountDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "sales",
				BillingMode: "PROVISIONED",
				ProvisionedThroughput: {
					ReadCapacityUnits: 3,
					WriteCapacityUnits: 1,
				},
				AttributeDefinitions: [
					{
						AttributeName: "saleId",
						AttributeType: "S",
					},
					{
						AttributeName: "storeId",
						AttributeType: "S",
					},
					{
						AttributeName: "createdAt_saleId",
						AttributeType: "S",
					},
					{
						AttributeName: "status_createdAt_saleId",
						AttributeType: "S",
					},
					{
						AttributeName: "clientId",
						AttributeType: "S",
					},
					{
						AttributeName: "storeId_clientId",
						AttributeType: "S",
					},
				],
				KeySchema: [
					{
						AttributeName: "saleId",
						KeyType: "HASH",
					},
				],
				GlobalSecondaryIndexes: [
					{
						IndexName: "StoreIdCreatedAtSaleId",
						KeySchema: [
							{
								AttributeName: "storeId",
								KeyType: "HASH",
							},
							{
								AttributeName: "createdAt_saleId",
								KeyType: "SORT",
							},
						],
					},
					{
						IndexName: "StoreIdStatusCreatedAtSaleId",
						KeySchema: [
							{
								AttributeName: "storeId",
								KeyType: "HASH",
							},
							{
								AttributeName: "status_createdAt_saleId",
								KeyType: "SORT",
							},
						],
					},
					{
						IndexName: "ClientIdCreatedAtSaleId",
						KeySchema: [
							{
								AttributeName: "clientId",
								KeyType: "HASH",
							},
							{
								AttributeName: "createdAt_saleId",
								KeyType: "SORT",
							},
						],
					},
					{
						IndexName: "ClientIdStatusCreatedAtSaleId",
						KeySchema: [
							{
								AttributeName: "clientId",
								KeyType: "HASH",
							},
							{
								AttributeName: "status_createdAt_saleId",
								KeyType: "SORT",
							},
						],
					},
					{
						IndexName: "StoreIdClientIdCreatedAtSaleId",
						KeySchema: [
							{
								AttributeName: "storeId_clientId",
								KeyType: "HASH",
							},
							{
								AttributeName: "createdAt_saleId",
								KeyType: "SORT",
							},
						],
					},
				],
			},
		},
	},
};
