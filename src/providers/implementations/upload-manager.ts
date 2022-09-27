/* eslint-disable @typescript-eslint/naming-convention */

import axios from "axios";
import type { ReadStream } from "fs";

import type { FileManager } from "../../adapters/file-manager";
import type { QueueManager } from "../../adapters/queue-manager";
import type { UploadManager, UploadFromUrlInput } from "../upload-manager";

import { MediaTypeEnum } from "../../types/enums/media-type";

export class UploadManagerProvider implements UploadManager {
	public constructor(
		private readonly queueManager: QueueManager,
		private readonly fileManager: FileManager,
	) {}

	public async uploadFromUrlBackground(p: UploadFromUrlInput) {
		await this.queueManager.sendMsg({
			to: process.env.UPLOAD_FROM_URL_QUEUE_URL!,
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
		queueToNotify,
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

			const ext = this.getExt(mediaTypeFromUrl);

			const readStream = await axios
				.get(mediaUrl, {
					responseType: "stream",
				})
				.then(r => r.data as ReadStream);

			const { filePath } = await this.fileManager.saveFile({
				folder,
				file: readStream,
				name: `${fileName}.${ext}`,
				metadata: id,
			});

			await this.queueManager.sendMsg({
				to: queueToNotify,
				message: {
					filePath,
					id,
				},
			});
		} catch (err: any) {
			await this.queueManager.sendMsg({
				to: queueToNotify,
				message: {
					error: err.message,
				},
			});
		}
	}

	protected getExt(mediaTypeFromUrl: string) {
		switch (true) {
			case mediaTypeFromUrl.startsWith("image/"):
				return mediaTypeFromUrl.replace("image/", "");
			default:
				return mediaTypeFromUrl.split("/").pop()!;
		}
	}
}
