import type { AWS } from "@serverless/typescript";

export const resourcesUpload: AWS["resources"] = {
	Resources: {
		UploadFromUrlQueue: {
			Type: "AWS::SQS::Queue",
			Properties: {
				QueueName:
					"${self:service}-${opt:stage, 'local'}-upload-from-url",
			},
		},
	},
	Outputs: {
		UploadFromUrlQueueUrl: {
			Value: {
				Ref: "UploadFromUrlQueue"
			},
			Export: {
				Name: {
					"Fn::Join": [
						":",
						[
							{
								Ref: "AWS::StackName",
							},
							"UploadFromUrlQueueUrl",
						],
					],
				},
			}
		}
	}
};
