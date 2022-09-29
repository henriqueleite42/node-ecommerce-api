import type { AWS } from "@serverless/typescript";

const PROVISIONED_THROUGHPUT_COUNTERS = {
	ReadCapacityUnits: 3,
	WriteCapacityUnits: 1,
};

export const resourcesBlacklist: AWS["resources"] = {
	Resources: {
		CounterDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "blacklists",
				ProvisionedThroughput: PROVISIONED_THROUGHPUT_COUNTERS,
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
