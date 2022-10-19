/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-magic-numbers */

import type {
	ButtonComponent,
	DiscordManager,
	SendMessageInput,
} from "../adapters/discord-manager";
import type { AccountRepository } from "../models/account";
import type {
	DiscordUseCase,
	SendNewProductAnnouncementMessagesInput,
	SendNewSaleAnnouncementMessagesInput,
	SendNewStoreAnnouncementMessagesInput,
} from "../models/discord";
import type { EventAlertEntity } from "../models/event-alert";
import type { ProductEntity } from "../models/product";
import type { SalePaidMessage } from "../models/sale";

import { colors } from "../config/colors";

import { DeliveryMethodEnum } from "../types/enums/delivery-method";
import { ProductTypeEnum } from "../types/enums/product-type";

export class DiscordUseCaseImplementation implements DiscordUseCase {
	public constructor(
		private readonly accountRepository: AccountRepository,
		private readonly discordManager: DiscordManager,
	) {}

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

		const message: Pick<SendMessageInput, "embeds"> = {
			embeds: [
				{
					author: {
						name: store.name,
						iconUrl: store.avatarUrl,
					},
					title: "Alguém fez uma compra! 😍",
					description,
					color: store.color || colors.maite,
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
		const embeds: SendMessageInput["embeds"] = [
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
				color: product.color || colors.maite,
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
							color: store.color || colors.maite,
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

	public async sendSalePaidMessage(sale: SalePaidMessage) {
		const account = await this.accountRepository.getByAccountId(sale.clientId);

		if (!account) return;

		const dmChannelId = await this.discordManager.getUserDmChannelId(
			account.discordId!,
		);

		await this.discordManager.sendMessage({
			channelId: dmChannelId,
			embeds: [
				{
					title: "Pagamento confirmado!",
					description:
						"Seu pagamento foi confirmado e o vendedor foi notificado! O conteúdo será enviado dentro do prazo especificado.\n\nCaso algum problema acontece, entre em contato com nosso suporte.",
					footer: {
						text: `ID da compra: ${sale.saleId}`,
					},
					color: colors.green,
				},
			],
			components: [
				[
					{
						style: "link",
						url: "",
						label: "Preciso de ajuda",
						emoji: "❓",
					},
				],
			],
		});
	}

	// Internal

	private getProductDisplayPrice(product: ProductEntity) {
		if (product.variations) {
			const variationsPrices = product.variations.map(p => p.price);

			const minValue = Math.min(...variationsPrices);
			const maxValue = Math.max(...variationsPrices);

			return `💵 ${this.formatBRLRange(minValue, maxValue)}`;
		}

		return this.formatBRL(product.price!);
	}

	private formatBRL(value: number) {
		return Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	}

	private formatBRLRange(minValue: number, maxValue: number) {
		return `R$ ${Math.floor(minValue)}-${Math.ceil(maxValue)}`;
	}

	private getTypeDisplay(deliveryMethod: ProductTypeEnum) {
		switch (deliveryMethod) {
			case ProductTypeEnum.PACK:
				return "📦 Pack";
			default:
				return "";
		}
	}

	private getDeliveryMethodDisplay(deliveryMethod: DeliveryMethodEnum) {
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

	private getRolesToMention(rolesToMention?: Array<string>) {
		if (!rolesToMention) return;

		return rolesToMention
			.map(r => {
				if (r === "@everyone") return r;

				return `<@&${r}>`;
			})
			.join(" ");
	}
}
