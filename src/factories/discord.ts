import { DiscordJSAdapter } from "../adapters/implementations/discordjs";
import type { DiscordUseCase } from "../models/discord";
import { DiscordUseCaseImplementation } from "../usecase/discord";

import { Service } from ".";

export class DiscordService extends Service<DiscordUseCase> {
	public getInstance() {
		const discordManager = new DiscordJSAdapter();

		return new DiscordUseCaseImplementation(discordManager);
	}
}
