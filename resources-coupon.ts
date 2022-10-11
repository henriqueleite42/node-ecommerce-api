import type { AWS } from "@serverless/typescript";

const PROVISIONED_THROUGHPUT_COUPONS = {
	ReadCapacityUnits: 3,
	WriteCapacityUnits: 1,
};

export const resourcesCoupon: AWS["resources"] = {
	Resources: {
		CouponDynamoDBTable: {
			DeletionPolicy: "Retain",
			UpdateReplacePolicy: "Retain",
			Type: "AWS::DynamoDB::Table",
			Properties: {
				TableName: "coupons",
				ProvisionedThroughput: PROVISIONED_THROUGHPUT_COUPONS,
				AttributeDefinitions: [
					{
						AttributeName: "storeId",
						AttributeType: "S",
					},
					{
						AttributeName: "code",
						AttributeType: "S",
					},
				],
				KeySchema: [
					{
						AttributeName: "storeId",
						KeyType: "HASH",
					},
					{
						AttributeName: "code",
						KeyType: "RANGE",
					},
				],
			},
		},
	},
};
