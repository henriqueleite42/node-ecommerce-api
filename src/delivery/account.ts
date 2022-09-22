import { createWithDiscordId } from "./http/account/create-with-discord-id/handler";
import { getByDiscordId } from "./http/account/get-by-discord-id/handler";
import { incrementBalance } from "./queue/account/increment-balance/handler";

export const account = {
	accountCreateWithDiscordId: createWithDiscordId,
	accountGetByDiscordId: getByDiscordId,
	accountIncrementBalance: incrementBalance,
};
