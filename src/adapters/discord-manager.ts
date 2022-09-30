export interface Embed {
	title?: string;
	titleUrl?: string;
	description?: string;
	color?: string;
	fields?: Array<{
		name: string;
		value: string;
		inline?: boolean;
	}>;
	iconUrl?: string;
	bannerUrl?: string;
	author?: {
		iconUrl?: string;
		name: string;
	};
	footer?: {
		iconUrl?: string;
		text: string;
	};
	timestamp?: Date;
}

export type ButtonStyle =
	| "danger"
	| "link"
	| "primary"
	| "secondary"
	| "success";

export interface BaseComponent {
	style: ButtonStyle;
	label: string;
	emoji: string;
}

export interface ButtonComponent extends BaseComponent {
	style: "danger" | "primary" | "secondary" | "success";
	customId: string;
}

export interface ButtonLinkComponent extends BaseComponent {
	style: "link";
	url: string;
}

export type Component = ButtonComponent | ButtonLinkComponent;

export type AnyComponent = BaseComponent &
	Partial<Omit<ButtonComponent, "style">> &
	Partial<Omit<ButtonLinkComponent, "style">>;

export interface SendMessageInput {
	channelId: string;
	content?: string;
	embeds?: Array<Embed>;
	components?: Array<Array<Component>>;
}

export interface DiscordManager {
	sendMessage: (p: SendMessageInput) => Promise<void>;
}
