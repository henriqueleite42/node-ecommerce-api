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
