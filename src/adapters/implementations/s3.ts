/* eslint-disable @typescript-eslint/naming-convention */

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { FileManager, SaveFileInput } from "adapters/file-manager";

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
		const proxyUrl = this.getProxyUrl(folder);

		const formattedMetadata: Record<string, string> = {};

		if (metadata) {
			Object.entries(metadata).forEach(([key, value]) => {
				formattedMetadata[key] = value.toString();
			});
		}

		await this.s3.send(
			new PutObjectCommand({
				Bucket: folder,
				Key: name,
				Body: file,
				Metadata: metadata ? formattedMetadata : undefined,
			}),
		);

		return {
			fileUrl: `${proxyUrl}/${name}`,
		};
	}

	private getProxyUrl(folder: string) {
		switch (folder) {
			case "products":
				return "";
			default:
				throw new Error("INVALID_FOLDER");
		}
	}
}
