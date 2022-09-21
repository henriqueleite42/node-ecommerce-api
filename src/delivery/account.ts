import { createWithDiscordId } from "./http/account/create-with-discord-id/handler";
import { getByDiscordId } from "./http/account/get-by-discord-id/handler";
import { incrementBalance } from "./queue/account/increment-balance/handler";

export const accountDomain = {
	accountDomainCreateWithDiscordId: createWithDiscordId,
	accountDomainGetByDiscordId: getByDiscordId,
	accountDomainIncrementBalance: incrementBalance,
};
