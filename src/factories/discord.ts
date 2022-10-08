import { DiscordJSAdapter } from "../adapters/implementations/discordjs";
import type { DiscordUseCase } from "../models/discord";
import { DiscordUseCaseImplementation } from "../usecase/discord";

import { Service } from ".";

let instance: DiscordUseCaseImplementation;

export class DiscordService extends Service<DiscordUseCase> {
	public getInstance() {
		if (instance) return instance;

		const discordManager = new DiscordJSAdapter();

		const newInstance = new DiscordUseCaseImplementation(discordManager);

		instance = newInstance;

		return instance;
	}
}
