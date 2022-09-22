import { createWithDiscordId } from "./http/account/create-with-discord-id/handler";
import { getByDiscordId } from "./http/account/get-by-discord-id/handler";

export const account = {
	accountCreateWithDiscordId: createWithDiscordId,
	accountGetByDiscordId: getByDiscordId,
};
