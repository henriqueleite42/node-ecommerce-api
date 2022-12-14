import type { AWS } from "@serverless/typescript";

const PROVISIONED_THROUGHPUT_BLACKLISTS = {
	ReadCapacityUnits: 1,
	WriteCapacityUnits: 1,
};

export const resourcesBlacklist: AWS["resources"] = {
	Resources: {
		/**
		 *
		 * Database
		 *
		 */
		BlacklistDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "blacklists",
				ProvisionedThroughput: PROVISIONED_THROUGHPUT_BLACKLISTS,
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
