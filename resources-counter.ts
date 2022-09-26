import type { AWS } from "@serverless/typescript";

export const resourcesCounter: AWS["resources"] = {
	Resources: {
		CounterDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "counters",
				ProvisionedThroughput: {
					ReadCapacityUnits: 3,
					WriteCapacityUnits: 1,
				},
				AttributeDefinitions: [
					{
						AttributeName: "pk",
						AttributeType: "S",
					},
					{
						AttributeName: "counter",
						AttributeType: "N",
					},
				],
				KeySchema: [
					{
						AttributeName: "pk",
						KeyType: "HASH",
					},
				],
				GlobalSecondaryIndexes: [
					{
						IndexName: "PkCounter",
						KeySchema: [
							{
								AttributeName: "pk",
								KeyType: "HASH",
							},
							{
								AttributeName: "counter",
								KeyType: "SORT",
							},
						],
					},
				],
			},
		},
	},
};
