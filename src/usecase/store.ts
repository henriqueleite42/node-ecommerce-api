/* eslint-disable sonarjs/no-duplicate-string */

import type { TopicManager } from "../adapters/topic-manager";
import type { BlacklistRepository } from "../models/blacklist";
import type { CounterRepository } from "../models/counter";
import type { ProductEntity, ProductRepository } from "../models/product";
import type {
	CreateInput,
	EditStoreInput,
	GetByNameInput,
	IncreaseSalesCountInput,
	IncreaseTotalBilledInput,
	StoreCreatedMessage,
	StoreRepository,
	StoreUseCase,
	GetUrlToUploadImgInput,
	GetByIdInput,
	UpdateAvatarUrlInput,
	UpdateBannerUrlInput,
} from "../models/store";
import type { UploadManager } from "../providers/upload-manager";

import { CustomError } from "../utils/error";

import { MediaTypeEnum } from "../types/enums/media-type";
import { StatusCodeEnum } from "../types/enums/status-code";

export class StoreUseCaseImplementation implements StoreUseCase {
	public constructor(
		private readonly storeRepository: StoreRepository,
		private readonly productRepository: ProductRepository,
		private readonly blacklistRepository: BlacklistRepository,
		private readonly counterRepository: CounterRepository,
		private readonly topicManager: TopicManager,
		private readonly uploadManager: UploadManager,
	) {}

	public async create(p: CreateInput) {
		const { storeCreation } = await this.blacklistRepository.get({
			accountId: p.accountId,
		});

		if (storeCreation) {
			throw new CustomError("User blacklisted", StatusCodeEnum.FORBIDDEN);
		}

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

		await this.topicManager.sendMsg<StoreCreatedMessage>({
			to: process.env.STORE_STORE_CREATED_TOPIC_ARN!,
			message: store,
		});

		return store;
	}

	public async edit(p: EditStoreInput) {
		const store = await this.storeRepository.edit(p);

		if (!store) {
			throw new CustomError("Store not found", StatusCodeEnum.NOT_FOUND);
		}

		return store;
	}

	public getUrlToUploadAvatar({ storeId }: GetUrlToUploadImgInput) {
		return this.uploadManager.getUrlToUpload({
			folder: process.env.STORE_MEDIA_BUCKET_NAME!,
			fileName: `avatars/${storeId}`,
			type: MediaTypeEnum.IMAGE,
		});
	}

	public getUrlToUploadBanner({ storeId }: GetUrlToUploadImgInput) {
		return this.uploadManager.getUrlToUpload({
			folder: process.env.STORE_MEDIA_BUCKET_NAME!,
			fileName: `banners/${storeId}`,
			type: MediaTypeEnum.IMAGE,
		});
	}

	public async updateAvatarUrl(p: UpdateAvatarUrlInput) {
		await this.storeRepository.edit(p);
	}

	public async updateBannerUrl(p: UpdateBannerUrlInput) {
		await this.storeRepository.edit(p);
	}

	public addProductType({ storeId, type }: ProductEntity) {
		return this.storeRepository.addProductType({
			storeId,
			productType: type,
		});
	}

	public async removeProductType({ storeId, type }: ProductEntity) {
		const store = await this.storeRepository.getById({
			storeId,
		});

		if (!store) {
			throw new CustomError("Store not found", StatusCodeEnum.NOT_FOUND);
		}

		const { items } = await this.productRepository.getProductsByType({
			storeId,
			type,
			limit: 1,
		});

		if (items.length === 0) {
			await this.storeRepository.removeProductType({
				storeId,
				productType: type,
			});
		}
	}

	public async getById(p: GetByIdInput) {
		const store = await this.storeRepository.getById(p);

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

		if (topStores.length === 0) {
			return [];
		}

		return this.storeRepository.getManyById(topStores);
	}

	public async getStoresCount() {
		const count = await this.counterRepository.getTotal("STORES");

		return {
			total: count,
		};
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
