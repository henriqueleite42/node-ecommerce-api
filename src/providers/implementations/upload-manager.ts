/* eslint-disable @typescript-eslint/naming-convention */

import type { FileManager } from "adapters/file-manager";
import type { QueueManager } from "adapters/queue-manager";
import axios from "axios";
import type { ReadStream } from "fs";
import { v4 } from "uuid";

import type { UploadManager, UploadFromUrlInput } from "../upload-manager";

import { MediaTypeEnum } from "types/enums/media-type";

export class UploadManagerProvider implements UploadManager {
	private readonly folders: Record<MediaTypeEnum, string> = {
		[MediaTypeEnum.IMAGE]: "images",
		[MediaTypeEnum.VIDEO]: "videos",
		[MediaTypeEnum.AUDIO]: "audios",
	};

	public constructor(
		private readonly queueManager: QueueManager,
		private readonly fileManager: FileManager,
	) {}

	public async uploadFromUrlBackground(p: UploadFromUrlInput) {
		await this.queueManager.sendMsg({
			to: process.env.UPLOAD_FROM_URL_QUEUE_URL!,
			message: p,
			metadata: {
				type: p.type,
				mediaType: p.mediaType,
			},
		});
	}

	public async uploadFromUrl({
		type,
		id,
		mediaUrl,
		mediaType,
		queueToNotify,
	}: UploadFromUrlInput) {
		try {
			const ext = await axios
				.head(mediaUrl)
				.then(r => r.headers["content-type"] as string | undefined);

			if (mediaType === MediaTypeEnum.IMAGE && !ext?.startsWith("image/")) {
				throw new Error("Invalid image");
			}

			if (mediaType === MediaTypeEnum.VIDEO && !ext?.startsWith("video/")) {
				throw new Error("Invalid video");
			}

			if (mediaType === MediaTypeEnum.AUDIO && !ext?.startsWith("audio/")) {
				throw new Error("Invalid audio");
			}

			const readStream = await axios
				.get(mediaUrl, {
					responseType: "stream",
				})
				.then(r => r.data as ReadStream);

			const { fileUrl } = await this.fileManager.saveFile({
				folder: this.folders[mediaType],
				file: readStream,
				name: v4(),
				metadata: {
					type,
					...id,
				},
			});

			await this.queueManager.sendMsg({
				to: queueToNotify,
				message: {
					fileUrl,
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
}
