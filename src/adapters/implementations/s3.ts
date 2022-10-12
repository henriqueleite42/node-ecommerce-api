/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/naming-convention */

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

import type {
	FileManager,
	GetFileInput,
	GetUrlToUploadInput,
	SaveFileInput,
} from "../../adapters/file-manager";

export class S3Adapter implements FileManager {
	private readonly s3: S3Client;

	// 100 MB
	private readonly limitUploadSize = 100 * 1024 * 1024;

	// 5 min
	private readonly uploadUrlExpirationSeconds = 5 * 60;

	public constructor() {
		this.s3 = new S3Client({});
	}

	public async saveFile({ folder, file, fileName, metadata }: SaveFileInput) {
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
				Key: fileName,
				Body: file,
				Metadata: metadata ? formattedMetadata : undefined,
			},
		});

		await upload.done();

		return {
			filePath: fileName,
		};
	}

	public async getUrlToUpload({ folder, type, fileName }: GetUrlToUploadInput) {
		const { url, fields } = await createPresignedPost(this.s3, {
			Bucket: folder,
			Key: fileName,
			Conditions: [
				["content-length-range", 1, this.limitUploadSize],
				["starts-with", "$Content-Type", type.toLowerCase()],
				["eq", "$key", fileName],
			],
			Expires: this.uploadUrlExpirationSeconds,
		});

		return {
			url,
			headers: fields,
		};
	}

	public async getFile({ folder, fileName }: GetFileInput) {
		const result = await this.s3.send(
			new GetObjectCommand({
				Bucket: folder,
				Key: fileName,
			}),
		);

		if (!result) return;

		return {
			file: result.Body as ReadableStream,
			contentType: result.ContentType as string,
		};
	}
}
