/* eslint-disable @typescript-eslint/naming-convention */
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";

import type {
	AnyComponent,
	ButtonStyle,
	DiscordManager,
	Embed,
	SendMessageInput,
} from "../discord-manager";

export class DiscordJSAdapter implements DiscordManager {
	protected discordjs: REST;

	private readonly buttonStyles: Record<ButtonStyle, number> = {
		primary: 1,
		secondary: 2,
		success: 3,
		danger: 4,
		link: 5,
	};

	public constructor() {
		this.discordjs = new REST({
			version: "10",
		}).setToken(process.env.DISCORD_BOT_TOKEN!);
	}

	public async sendMessage({
		channelId,
		content,
		embeds,
		components,
	}: SendMessageInput) {
		let embedsFormatted;
		let componentsFormatted;

		if (embeds) {
			embedsFormatted = embeds.map(this.embedToDiscordEmbed);
		}

		if (components) {
			componentsFormatted = components.map(
				this.componentRowToDiscordComponentRow,
			);
		}

		await this.discordjs.post(Routes.channelMessages(channelId), {
			body: {
				content,
				embeds: embedsFormatted,
				components: componentsFormatted,
			},
		});
	}

	protected getColorNumber(color: string) {
		return parseInt(color.replace("#", ""), 16);
	}

	protected embedToDiscordEmbed(embed: Embed) {
		return {
			type: "rich",
			title: embed.title,
			description: embed.description,
			url: embed.titleUrl,
			color: embed.color ? this.getColorNumber(embed.color) : undefined,
			timestamp: embed.timestamp ? embed.timestamp.toISOString() : undefined,
			footer: embed.footer
				? {
						text: embed.footer.text,
						icon_url: embed.footer.iconUrl,
				  }
				: undefined,
			author: embed.author
				? {
						name: embed.author.name,
						icon_url: embed.author.iconUrl,
				  }
				: undefined,
			image: embed.bannerUrl
				? {
						url: embed.bannerUrl,
				  }
				: undefined,
			thumbnail: embed.iconUrl
				? {
						url: embed.iconUrl,
				  }
				: undefined,
			fields: embed.fields ? embed.fields : undefined,
		};
	}

	protected componentRowToDiscordComponentRow(
		componentsRow: Array<AnyComponent>,
	) {
		return {
			type: 1,
			components: componentsRow.map(c => ({
				type: 2,
				label: c.label,
				custom_id: c.customId,
				url: c.url,
				emoji: c.emoji
					? {
							name: c.emoji,
					  }
					: undefined,
				style: this.buttonStyles[c.style],
			})),
		};
	}
}
