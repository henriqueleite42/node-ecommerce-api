export interface CloudFrontLambdaEdgeEvent {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	Records: [
		{
			cf: {
				config: {
					distributionId: string; // "EDFDVBD6EXAMPLE"
				};
				request: {
					clientIp: string; // "2001:0db8:85a3:0:0:8a2e:0370:7334"
					method: string; // "GET"
					uri: string; // "/picture.jpg"
					headers: Record<
						string,
						Array<{
							key: string;
							value: string;
						}>
					>;
					/*
					 * Headers: {
					 * 	"host": [
					 * 		{
					 * 			key: "Host";
					 * 			value: "d111111abcdef8.cloudfront.net";
					 * 		},
					 * 	];
					 * 	"user-agent": [
					 * 		{
					 * 			key: "User-Agent";
					 * 			value: "curl/7.51.0";
					 * 		},
					 * 	];
					 * }
					 */
				};
			};
		},
	];
}
