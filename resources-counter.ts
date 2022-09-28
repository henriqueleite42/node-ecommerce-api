import type { AWS } from "@serverless/typescript";

const PROVISIONED_THROUGHPUT_COUNTERS = {
	ReadCapacityUnits: 3,
	WriteCapacityUnits: 1,
};

export const resourcesCounter: AWS["resources"] = {
	Resources: {
		CounterDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "counters",
				ProvisionedThroughput: PROVISIONED_THROUGHPUT_COUNTERS,
				AttributeDefinitions: [
					{
						AttributeName: "pk",
						AttributeType: "S",
					},
					{
						AttributeName: "sk",
						AttributeType: "S",
					},
					{
						AttributeName: "count",
						AttributeType: "N",
					},
				],
				KeySchema: [
					{
						AttributeName: "pk",
						KeyType: "HASH",
					},
					{
						AttributeName: "sk",
						KeyType: "RANGE",
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
								AttributeName: "count",
								KeyType: "RANGE",
							},
						],
						Projection: {
							ProjectionType: "ALL"
						},
						ProvisionedThroughput: PROVISIONED_THROUGHPUT_COUNTERS,
					},
				],
			},
		},
	},
};
