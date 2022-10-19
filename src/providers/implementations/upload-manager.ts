/* eslint-disable @typescript-eslint/naming-convention */

import axios from "axios";
import type { ReadStream } from "fs";

import type { FileManager } from "../../adapters/file-manager";
import type { QueueManager } from "../../adapters/queue-manager";
import type {
	UploadManager,
	UploadFromUrlInput,
	GetUrlToUploadInput,
} from "../upload-manager";

import { MediaTypeEnum } from "../../types/enums/media-type";

export class UploadManagerProvider implements UploadManager {
	public constructor(
		private readonly queueManager: QueueManager,
		private readonly fileManager: FileManager,
	) {}

	public async uploadFromUrlBackground(p: UploadFromUrlInput) {
		await this.queueManager.sendMsg<UploadFromUrlInput>({
			to: process.env.UPLOAD_UPLOAD_FROM_URL_QUEUE_URL!,
			message: p,
			metadata: {
				mediaType: p.mediaType,
			},
		});
	}

	public async uploadFromUrl({
		folder,
		id,
		fileName,
		mediaUrl,
		mediaType,
	}: UploadFromUrlInput) {
		try {
			const mediaTypeFromUrl = await axios
				.head(mediaUrl)
				.then(r => r.headers["content-type"] || "");

			if (
				mediaType === MediaTypeEnum.IMAGE &&
				!mediaTypeFromUrl?.startsWith("image/")
			) {
				throw new Error("Invalid image");
			}

			if (
				mediaType === MediaTypeEnum.VIDEO &&
				!mediaTypeFromUrl?.startsWith("video/")
			) {
				throw new Error("Invalid video");
			}

			if (
				mediaType === MediaTypeEnum.AUDIO &&
				!mediaTypeFromUrl?.startsWith("audio/")
			) {
				throw new Error("Invalid audio");
			}

			const readStream = await axios
				.get(mediaUrl, {
					responseType: "stream",
				})
				.then(r => r.data as ReadStream);

			await this.fileManager.saveFile({
				folder,
				file: readStream,
				fileName,
				metadata: id,
			});
		} catch (err: any) {
			console.error(err);
		}
	}

	public getUrlToUpload(p: GetUrlToUploadInput) {
		return this.fileManager.getUrlToUpload(p);
	}
}
