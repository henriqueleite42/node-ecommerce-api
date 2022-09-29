import type {
	BlacklistRepository,
	BlacklistUseCase,
	CreateInput,
} from "../models/blacklist";

export class BlacklistUseCaseImplementation implements BlacklistUseCase {
	public constructor(
		private readonly blacklistRepository: BlacklistRepository,
	) {}

	public async blacklist(p: CreateInput) {
		await this.blacklistRepository.create(p);
	}
}
