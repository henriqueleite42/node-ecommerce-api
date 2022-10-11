import { EventAlertService } from "../../../factories/event-alert";
import type { DeleteAllFromDiscordChannelInput } from "../../../models/event-alert";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const deleteAllFromDiscordChannel = (server: HttpManager) => {
	server.addRoute<DeleteAllFromDiscordChannelInput>(
		{
			method: "DELETE",
			path: "event-alerts/discord-channel",
			auth: ["DISCORD"],
			validations: [
				{
					key: "discordGuildId",
					loc: "body",
					validations: [Validations.required, Validations.discordId],
				},
				{
					key: "discordChannelId",
					loc: "body",
					validations: [Validations.required, Validations.discordId],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new EventAlertService().getInstance();

				return service.deleteAllFromDiscordChannel(p);
			}),
	);
};
