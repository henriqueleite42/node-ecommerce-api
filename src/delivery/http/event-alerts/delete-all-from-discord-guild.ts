import { EventAlertService } from "../../../factories/event-alert";
import type { DeleteAllFromDiscordGuildInput } from "../../../models/event-alert";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const deleteAllFromDiscordGuild = (server: HttpManager) => {
	server.addRoute<DeleteAllFromDiscordGuildInput>(
		{
			method: "DELETE",
			path: "event-alerts/discord-guild",
			auth: ["DISCORD_BOT"],
			validations: [
				{
					key: "discordGuildId",
					loc: "body",
					validations: [Validations.required, Validations.discordId],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new EventAlertService().getInstance();

				return service.deleteAllFromDiscordGuild(p);
			}),
	);
};
