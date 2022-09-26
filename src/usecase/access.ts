import type { TopicManager } from "../adapters/topic-manager";
import type {
	AccessIds,
	AccessRepository,
	AccessUseCase,
	CreateManyInput,
} from "../models/access";

export class AccessUseCaseImplementation implements AccessUseCase {
	public constructor(
		private readonly accessRepository: AccessRepository,
		private readonly topicManager: TopicManager,
	) {}

	public async createMany(p: CreateManyInput) {
		const access = await this.accessRepository.createMany(p);

		await this.topicManager.sendMsg({
			to: process.env.ACCESS_CREATED_TOPIC_ARN!,
			message: access,
		});
	}

	public async get(p: AccessIds) {
		const access = await this.accessRepository.get(p);

		if (!access) {
			throw new Error("User doesn't have access to this content");
		}

		return access;
	}
}
