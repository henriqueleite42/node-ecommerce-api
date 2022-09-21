import type { CounterRepository } from "models/counters";
import type {
	CreateInput,
	EditInput,
	GetAllFromAccountInput,
	GetByNameInput,
	IncreaseSalesCountInput,
	IncreaseTotalBilledInput,
	StoreRepository,
	StoreUseCase,
} from "models/store";

export class StoreUseCaseImplementation implements StoreUseCase {
	public constructor(
		private readonly storeRepository: StoreRepository,
		private readonly counterRepository: CounterRepository,
	) {}

	public async create(p: CreateInput) {
		const storeWithSameName = await this.getByName(p);

		if (storeWithSameName) {
			throw new Error("DUPLICATED_NAME");
		}

		return this.storeRepository.create(p);
	}

	public async edit(p: EditInput) {
		const store = await this.storeRepository.edit(p);

		if (!store) {
			throw new Error("NOT_FOUND");
		}

		return store;
	}

	public getAllFromAccount(p: GetAllFromAccountInput) {
		return this.storeRepository.getAllFromAccount(p);
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
