/* eslint-disable capitalized-comments */
/* eslint-disable multiline-comment-style */
/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-magic-numbers */

import type {
	ButtonComponent,
	DiscordManager,
	SendMessageInput,
} from "../adapters/discord-manager";
import type { AccessGrantedMessage } from "../models/content";
import type {
	CreateWithDiscordIdInput,
	DiscordNotifySellerLiveProductsSaleMessage,
	DiscordRepository,
	DiscordUseCase,
	SendNewProductAnnouncementMessagesInput,
	SendNewSaleAnnouncementMessagesInput,
	SendNewStoreAnnouncementMessagesInput,
} from "../models/discord";
import type { EventAlertEntity } from "../models/event-alert";
import type { ProductEntity } from "../models/product";
import type {
	SaleDeliveredMessage,
	SaleDeliveryConfirmedMessage,
	SalePaidMessage,
} from "../models/sale";

import { colors } from "../config/colors";
import { images } from "../config/images";
import { urls } from "../config/urls";

import { PlatformEnum } from "../types/enums/platform";
import {
	isCustomProduct,
	isLiveProduct,
	ProductTypeEnum,
} from "../types/enums/product-type";

export class DiscordUseCaseImplementation implements DiscordUseCase {
	private readonly necessaryDiscordScopes = [
		"identify",
		"email",
		"gdm.join",
		"guilds",
		"guilds.members.read",
	] as Array<string>;

	public constructor(
		private readonly discordRepository: DiscordRepository,
		private readonly discordManager: DiscordManager,
	) {}

	public async createWithDiscordId(p: CreateWithDiscordIdInput) {
		const alreadyExists = await this.discordRepository.getByDiscordId(
			p.discordId,
		);

		if (alreadyExists) {
			return alreadyExists;
		}

		return this.discordRepository.createWithDiscordId(p);
	}

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

	public async sendBuyerSalePaidMessage(sale: SalePaidMessage) {
		const discord = await this.discordRepository.getByAccountId(sale.clientId);

		if (!discord) return;

		const dmChannelId = await this.discordManager.getUserDmChannelId(
			discord.discordId!,
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
						url: urls.discordServerSupportInvite(),
						label: "Preciso de ajuda",
						emoji: "❓",
					},
				],
			],
		});
	}

	/**
	 * This will have to be reviewed when we implement other platforms.
	 *
	 * Rn it considers that every purchase is made via Discord.
	 *
	 * In the future we should simply notify the seller once a day that
	 * she has X amount of products to deliver (only if she has any
	 * product to be delivered)
	 */
	public async sendSellerOrderLiveCustomProductCreatedMessage({
		sale,
		discordId: sellerDiscordId,
	}: DiscordNotifySellerLiveProductsSaleMessage) {
		// const originPlatform = sale.origin.split("#").shift()! as PlatformEnum;
		const originPlatform = PlatformEnum.DISCORD;

		const buyerAccount = await this.discordRepository.getByAccountId(
			sale.clientId,
		);

		if (!buyerAccount) return;

		const discordData = await this.discordManager.getUserData(
			buyerAccount.discordId!,
		);

		const dmChannelId = await this.discordManager.getUserDmChannelId(
			sellerDiscordId,
		);

		const products = sale.products.filter(
			p => isLiveProduct(p.type) || isCustomProduct(p.type),
		);

		await this.discordManager.sendMessage({
			channelId: dmChannelId,
			embeds: [
				{
					title: "Novo pedido!",
					description: [
						"O pagamento da compra foi confirmado, você já pode enviar o conteúdo! Por enquanto, o conteúdo precisa ser entregue de forma **MANUAL**, você tem que entrar em contato com o comprador para entregar o conteúdo.",
						[
							"**Conteúdos comprados e descrição do pedido:**",
							"--------",
							products.map(p =>
								[p.name, p.buyerMessage || "_n/a_", "--------"].join("\n"),
							),
						].join("\n"),
					].join("\n\n"),
					fields: [
						{
							name: "Entragar via:",
							value: this.getPlatformDisplay(originPlatform),
						},
						{
							name: "Tag do comprador:",
							value: discordData.tag,
						},
					],
					footer: {
						text: `ID da compra: ${sale.saleId}`,
					},
					color: colors.green,
				},
			],
			components: [
				products.map(p => ({
					style: "secondary",
					customId: `SET_PRODUCT_AS_DELIVERED/${sale.saleId}/${p.productId}`,
					label: `Marcar ${p.name} como entregue`,
					emoji: "✅",
				})),
			],
		});
	}

	public async sendBuyerAccessGrantedMessage({
		saleId,
		storeId,
		clientId,
		product,
	}: AccessGrantedMessage) {
		const buyerAccount = await this.discordRepository.getByAccountId(clientId);

		if (!buyerAccount?.discordId) return;

		const dmChannelId = await this.discordManager.getUserDmChannelId(
			buyerAccount.discordId,
		);

		await this.discordManager.sendMessage({
			channelId: dmChannelId,
			embeds: [
				{
					title: "Acesso liberado!",
					description: `Seu acesso ao conteúdo ${product.name} foi liberado!`,
					footer: {
						text: `ID da compra: ${saleId}`,
					},
					color: colors.green,
				},
			],
			components: [
				[
					{
						style: "link",
						url: urls.platformAccessContent(storeId, product.productId),
						label: "Ver conteúdo",
						emoji: "🔥",
					},
				],
			],
		});
	}

	public async sendBuyerSaleDeliveredMessage({
		saleId,
		clientId,
		products,
	}: SaleDeliveredMessage) {
		const buyerAccount = await this.discordRepository.getByAccountId(clientId);

		if (!buyerAccount?.discordId) return;

		const dmChannelId = await this.discordManager.getUserDmChannelId(
			buyerAccount.discordId,
		);

		await this.discordManager.sendMessage({
			channelId: dmChannelId,
			embeds: [
				{
					title: "Conteúdo entregue!",
					description: `Sua compra foi marcada como entregue, e com isso esta tudo pronto! 🤩

**Conteúdos:**
${products.map(p => `- ${p.name}`).join("\n")}

Caso você não tenha recebido seus conteúdos ou teve algum problema com a compra, por favor entre em contato com a gente que resolveremos.`,
					fields: [
						{
							name: "Id da compra",
							value: saleId,
						},
					],
					color: colors.blue,
					iconUrl: images.maiteAvatar,
				},
			],
			components: [
				[
					{
						style: "primary",
						customId: `CONFIRM_SALE_DELIVERY/${saleId}`,
						label: "Confirmar recebimento",
						emoji: "👍",
					},
					{
						style: "link",
						url: urls.discordServerSupportInvite(),
						label: "Preciso de ajuda",
						emoji: "❓",
					},
				],
			],
		});
	}

	public async sendBuyerSaleDeliveryConfirmedMessage({
		saleId,
		clientId,
		products,
	}: SaleDeliveryConfirmedMessage) {
		const buyerAccount = await this.discordRepository.getByAccountId(clientId);

		if (!buyerAccount?.discordId) return;

		const dmChannelId = await this.discordManager.getUserDmChannelId(
			buyerAccount.discordId,
		);

		await this.discordManager.sendMessage({
			channelId: dmChannelId,
			embeds: [
				{
					title: "Tudo prontinho! 🤩",
					description: [
						"Como você confirmou que recebeu seus conteúdos (ou demorou mais de 48h para dizquer que aconteceu algum problema), nós finalizamos a venda e o dinheiro foi liberado para a vendedora.",
						["**Conteúdos:**", ...products.map(p => `- ${p.name}`)].join("\n"),
					].join("\n\n"),
					fields: [
						{
							name: "Id da compra",
							value: saleId,
						},
						{
							name: "Que tal dar um feedback sobre o conteúdo que vc comprou? 🥰",
							value: "É só clicar no botão aqui embaixo ⬇️",
						},
					],
					color: colors.blue,
					iconUrl: images.maiteAvatar,
				},
			],
			components: [
				[
					{
						style: "primary",
						customId: `SALE_FEEDBACK/${saleId}`,
						label: "Dar um feedback",
						emoji: "⭐️",
					},
				],
			],
		});
	}

	public async sendSellerSaleDeliveryConfirmedMessage({
		saleId,
		storeId,
		finalValue,
	}: SaleDeliveryConfirmedMessage) {
		const sellerAccount = await this.discordRepository.getByAccountId(storeId);

		if (!sellerAccount?.discordId) return;

		const dmChannelId = await this.discordManager.getUserDmChannelId(
			sellerAccount.discordId,
		);

		await this.discordManager.sendMessage({
			channelId: dmChannelId,
			embeds: [
				{
					title: "Tudo prontinho! 🤩",
					description: `A entrega dos conteúdos da venda \`${saleId}\` foi confirmada e o dinheiro foi liberado para sua conta! 🥰`,
					fields: [
						{
							name: "Valor da venda",
							value: `💵 ${this.formatBRL(finalValue!)}`,
						},
					],
					color: colors.green,
					iconUrl: images.maiteAvatar,
				},
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

	private getPlatformDisplay(platform: PlatformEnum) {
		switch (platform) {
			case PlatformEnum.DISCORD:
				return "🟦 Discord";
			case PlatformEnum.TELEGRAM:
				return "✈️ Telegram";
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
