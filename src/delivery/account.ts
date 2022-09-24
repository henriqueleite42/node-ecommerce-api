import { createWithDiscordId } from "./http/account/create-with-discord-id";
import { getByDiscordId } from "./http/account/get-by-discord-id";

export const account = {
	accountCreateWithDiscordId: createWithDiscordId,
	accountGetByDiscordId: getByDiscordId,
};
