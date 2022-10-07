/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-magic-numbers */

import type {
	ButtonComponent,
	DiscordManager,
} from "../adapters/discord-manager";
import type {
	DiscordUseCase,
	SendNewProductAnnouncementMessagesInput,
	SendNewSaleAnnouncementMessagesInput,
	SendNewStoreAnnouncementMessagesInput,
} from "../models/discord";
import type { EventAlertEntity } from "../models/event-alert";
import type { ProductEntity } from "../models/product";

import { DeliveryMethodEnum } from "../types/enums/delivery-method";
import { ProductTypeEnum } from "../types/enums/product-type";

export class DiscordUseCaseImplementation implements DiscordUseCase {
	public constructor(private readonly discordManager: DiscordManager) {}

	public async sendNewSaleAnnouncementMessages({
		items,
		sale,
		store,
	}: SendNewSaleAnnouncementMessagesInput) {
		const description = sale.products
			.map(p =>
				[
					`**Conteúdo:** ${p.name}`,
					`**Tipo:** ${this.getTypeDisplay(p.type)}`,
					`**Valor:** ${this.formatBRL(p.originalPrice)}`,
				].join("\n"),
			)
			.join("\n\n");

		const productsChunk = [
			sale.products.slice(0, 4),
			sale.products.slice(4, 9),
			sale.products.slice(9, 14),
		].filter(arr => arr.length !== 0);

		const makeComponents = (i: EventAlertEntity) =>
			productsChunk.map((chunk, ui) => {
				const row = [] as Array<ButtonComponent>;

				if (ui === 0) {
					row.push({
						style: "primary",
						customId: `SEE_STORE/${store.storeId}`,
						label: "Ver lojinha",
						emoji: "🛍",
					});
				}

				row.push(
					...chunk.map(
						p =>
							({
								style: "success",
								customId: `BUY_PRODUCT/${store.storeId}/${p.productId}/GUILD#${i.discordGuildId}`,
								label: "Comprar",
								emoji: "🔥",
							} as any),
					),
				);

				return row;
			});

		const message = {
			embeds: [
				{
					author: {
						name: store.name,
						iconUrl: store.avatarUrl,
					},
					title: "Alguém fez uma compra! 😍",
					description,
				},
			],
		};

		await Promise.all(
			items.map(i => {
				const rolesToMention = this.getRolesToMention(i.discordRolesToMention);

				return this.discordManager.sendMessage({
					channelId: i.discordChannelId!,
					content: rolesToMention,
					components: makeComponents(i),
					...(message as any),
				});
			}),
		);
	}

	public async sendNewProductAnnouncementMessages({
		items,
		product,
		store,
	}: SendNewProductAnnouncementMessagesInput) {
		const embeds = [
			{
				author: {
					name: store.name,
					iconUrl: store.avatarUrl,
				},
				title: product.name,
				description: product.description,
				fields: [
					{
						name: "Valor",
						value: this.getProductDisplayPrice(product),
					},
					{
						name: "Entrega",
						value: this.getProductDisplayPrice(product),
					},
				],
			},
		];

		await Promise.all(
			items.map(i =>
				this.discordManager.sendMessage({
					channelId: i.discordChannelId!,
					embeds,
					components: [
						[
							{
								style: "primary",
								customId: `SEE_STORE/${store.storeId}`,
								label: "Ver lojinha",
								emoji: "🛍",
							},
							{
								style: "success",
								customId: `BUY_PRODUCT/${store.storeId}/${product.productId}/GUILD#${i.discordGuildId}`,
								label: "Comprar",
								emoji: "🔥",
							},
						],
					],
				}),
			),
		);

		await Promise.all(
			items.map(i => {
				const rolesToMention = this.getRolesToMention(i.discordRolesToMention);

				return this.discordManager.sendMessage({
					channelId: i.discordChannelId!,
					content: rolesToMention,
					embeds,
					components: [
						[
							{
								style: "primary",
								customId: `SEE_STORE/${store.storeId}`,
								label: "Ver lojinha",
								emoji: "🛍",
							},
							{
								style: "success",
								customId: `BUY_PRODUCT/${store.storeId}/${product.productId}/GUILD#${i.discordGuildId}`,
								label: "Comprar",
								emoji: "🔥",
							},
						],
					],
				});
			}),
		);
	}

	public async sendNewStoreAnnouncementMessages({
		items,
		store,
	}: SendNewStoreAnnouncementMessagesInput) {
		await Promise.all(
			items.map(i => {
				const rolesToMention = this.getRolesToMention(i.discordRolesToMention);

				return this.discordManager.sendMessage({
					channelId: i.discordChannelId!,
					content: rolesToMention,
					embeds: [
						{
							author: {
								name: store.name,
								iconUrl: store.avatarUrl,
							},
							title: `${store.name} também está vendendo conteúdos comigo! 😍`,
							description:
								"Já já terão novos conteúdos fresquinhos pra vocês 🥵",
							bannerUrl: store.bannerUrl,
						},
					],
					components: [
						[
							{
								style: "primary",
								customId: `SEE_STORE/${store.storeId}`,
								label: "Ver lojinha",
								emoji: "🛍",
							},
						],
					],
				});
			}),
		);
	}

	protected getProductDisplayPrice(product: ProductEntity) {
		if (product.variations) {
			const variationsPrices = product.variations.map(p => p.price);

			const minValue = Math.min(...variationsPrices);
			const maxValue = Math.max(...variationsPrices);

			return `💵 ${this.formatBRLRange(minValue, maxValue)}`;
		}

		return this.formatBRL(product.price!);
	}

	protected formatBRL(value: number) {
		return Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	}

	protected formatBRLRange(minValue: number, maxValue: number) {
		return `R$ ${Math.floor(minValue)}-${Math.ceil(maxValue)}`;
	}

	protected getTypeDisplay(deliveryMethod: ProductTypeEnum) {
		switch (deliveryMethod) {
			case ProductTypeEnum.PACK:
				return "📦 Pack";
			default:
				return "";
		}
	}

	protected getDeliveryMethodDisplay(deliveryMethod: DeliveryMethodEnum) {
		switch (deliveryMethod) {
			case DeliveryMethodEnum.AUTOMATIC_DISCORD_DM:
				return "🟦 Automaticamente via DM";
			case DeliveryMethodEnum.MANUAL_DISCORD_DM:
				return "🟦 Manualmente via DM";
			case DeliveryMethodEnum.MANUAL_GOOGLE_DRIVE_ACCESS:
				return "🔰 Manualmente via Google Drive";
			default:
				return "";
		}
	}

	protected getRolesToMention(rolesToMention?: Array<string>) {
		if (!rolesToMention) return;

		return rolesToMention
			.map(r => {
				if (r === "@everyone") return r;

				return `<@&${r}>`;
			})
			.join(" ");
	}
}
