import type { TopicManager } from "../adapters/topic-manager";
import type { CounterRepository } from "../models/counters";
import type {
	CreateInput,
	EditInput,
	GetByNameInput,
	IncreaseSalesCountInput,
	IncreaseTotalBilledInput,
	StoreRepository,
	StoreUseCase,
} from "../models/store";
import type { UploadManager } from "../providers/upload-manager";

import { CustomError } from "../utils/error";

import { MediaTypeEnum } from "../types/enums/media-type";
import { StatusCodeEnum } from "../types/enums/status-code";

export class StoreUseCaseImplementation implements StoreUseCase {
	public constructor(
		private readonly storeRepository: StoreRepository,
		private readonly counterRepository: CounterRepository,
		private readonly topicManager: TopicManager,
		private readonly uploadManager: UploadManager,
	) {}

	public async create({ avatarUrl, bannerUrl, ...p }: CreateInput) {
		const accountAlreadyHasStore = await this.storeRepository.getById({
			storeId: p.accountId,
		});

		if (accountAlreadyHasStore) {
			throw new CustomError(
				"User already has a store",
				StatusCodeEnum.CONFLICT,
			);
		}

		const storeWithSameName = await this.storeRepository.getByName(p);

		if (storeWithSameName) {
			throw new CustomError(
				"A store with the same name already exists",
				StatusCodeEnum.CONFLICT,
			);
		}

		const store = await this.storeRepository.create(p);

		if (avatarUrl) {
			await this.uploadManager.uploadFromUrlBackground({
				folder: process.env.MEDIA_BUCKET_NAME!,
				fileName: `avatars/${store.storeId}`,
				id: {
					storeId: store.storeId,
				},
				mediaUrl: avatarUrl,
				mediaType: MediaTypeEnum.IMAGE,
				queueToNotify: process.env.UPDATE_AVATAR_QUEUE_URL!,
			});
		}

		if (bannerUrl) {
			await this.uploadManager.uploadFromUrlBackground({
				folder: process.env.MEDIA_BUCKET_NAME!,
				fileName: `banners/${store.storeId}`,
				id: {
					storeId: store.storeId,
				},
				mediaUrl: bannerUrl,
				mediaType: MediaTypeEnum.IMAGE,
				queueToNotify: process.env.UPDATE_BANNER_QUEUE_URL!,
			});
		}

		await this.topicManager.sendMsg({
			to: process.env.STORE_CREATED_TOPIC_ARN!,
			message: store,
		});

		return store;
	}

	public async edit(p: EditInput) {
		const store = await this.storeRepository.edit(p);

		if (!store) {
			throw new CustomError("Store not found", StatusCodeEnum.NOT_FOUND);
		}

		return store;
	}

	public async getByName(p: GetByNameInput) {
		const store = await this.storeRepository.getByName(p);

		if (!store) {
			throw new CustomError("Store not found", StatusCodeEnum.NOT_FOUND);
		}

		return store;
	}

	public async getTop() {
		const topStores = await this.counterRepository.getTopStores();

		return this.storeRepository.getManyById(topStores);
	}

	public getStoresCount() {
		return this.counterRepository.getTotal("STORES");
	}

	public async increaseStoresCount() {
		await this.counterRepository.incrementTotal("STORES");
	}

	public async increaseSalesCount({ storeId }: IncreaseSalesCountInput) {
		await this.counterRepository.incrementStore({
			storeId,
			qtd: 1,
			type: "TOTAL_BILLED",
		});
	}

	public async increaseTotalBilled({
		storeId,
		amount,
	}: IncreaseTotalBilledInput) {
		await this.counterRepository.incrementStore({
			storeId,
			qtd: amount,
			type: "TOTAL_BILLED",
		});
	}
}
