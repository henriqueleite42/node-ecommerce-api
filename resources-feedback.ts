import type { AWS } from "@serverless/typescript";

const PROVISIONED_THROUGHPUT_FEEDBACKS = {
	ReadCapacityUnits: 1,
	WriteCapacityUnits: 1,
};

export const resourcesFeedback: AWS["resources"] = {
	Resources: {
		/**
		 *
		 * Database
		 *
		 */
		AccountDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "feedbacks",
				ProvisionedThroughput: PROVISIONED_THROUGHPUT_FEEDBACKS,
				AttributeDefinitions: [
					{
						AttributeName: "feedbackId",
						AttributeType: "S",
					},
					{
						AttributeName: "storeId",
						AttributeType: "S",
					},
					{
						AttributeName: "display_feedbackId",
						AttributeType: "S",
					},
				],
				KeySchema: [
					{
						AttributeName: "feedbackId",
						KeyType: "HASH",
					},
				],
				GlobalSecondaryIndexes: [
					{
						IndexName: "StoreIdDisplayFeedbackId",
						KeySchema: [
							{
								AttributeName: "storeId",
								KeyType: "HASH",
							},
							{
								AttributeName: "display_feedbackId",
								KeyType: "RANGE",
							},
						],
						Projection: {
							ProjectionType: "ALL"
						},
						ProvisionedThroughput: PROVISIONED_THROUGHPUT_FEEDBACKS,
					},
				],
			},
		},
	},
};
