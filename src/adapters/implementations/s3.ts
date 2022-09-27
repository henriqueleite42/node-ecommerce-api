/* eslint-disable @typescript-eslint/naming-convention */

import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

import type { FileManager, SaveFileInput } from "../../adapters/file-manager";

export class S3Adapter implements FileManager {
	private readonly s3: S3Client;

	public constructor() {
		const { NODE_ENV } = process.env;

		if (NODE_ENV === "local") {
			this.s3 = {
				send: () => {},
			} as unknown as S3Client;
		} else {
			this.s3 = new S3Client({});
		}
	}

	public async saveFile({ folder, file, name, metadata }: SaveFileInput) {
		const formattedMetadata: Record<string, string> = {};

		if (metadata) {
			Object.entries(metadata).forEach(([key, value]) => {
				formattedMetadata[key] = value.toString();
			});
		}

		const upload = new Upload({
			client: this.s3,
			params: {
				Bucket: folder,
				Key: name,
				Body: file,
				Metadata: metadata ? formattedMetadata : undefined,
			},
		});

		await upload.done();

		return {
			filePath: name,
		};
	}
}
