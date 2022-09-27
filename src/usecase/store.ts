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

export class StoreUseCaseImplementation implements StoreUseCase {
	public constructor(
		private readonly storeRepository: StoreRepository,
		private readonly counterRepository: CounterRepository,
		private readonly topicManager: TopicManager,
	) {}

	public async create(p: CreateInput) {
		const accountAlreadyHasStore = await this.storeRepository.getById({
			storeId: p.accountId,
		});

		if (accountAlreadyHasStore) {
			throw new Error("ALREADY_HAS_STORE");
		}

		const storeWithSameName = await this.storeRepository.getByName(p);

		if (storeWithSameName) {
			throw new Error("DUPLICATED_NAME");
		}

		const store = await this.storeRepository.create(p);

		await this.topicManager.sendMsg({
			to: process.env.STORE_CREATED_TOPIC_ARN!,
			message: store,
		});

		return store;
	}

	public async edit(p: EditInput) {
		const store = await this.storeRepository.edit(p);

		if (!store) {
			throw new Error("NOT_FOUND");
		}

		return store;
	}

	public async getByName(p: GetByNameInput) {
		const store = await this.storeRepository.getByName(p);

		if (!store) {
			throw new Error("NOT_FOUND");
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
