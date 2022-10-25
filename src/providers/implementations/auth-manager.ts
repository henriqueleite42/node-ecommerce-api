import type {
	AccessTokenManager,
	TokenData,
} from "../../adapters/access-token-manager";
import type { ArrayAllowedAuthTypes } from "../../providers/auth-manager";
import { AuthManager } from "../../providers/auth-manager";

export class AuthManagerProvider extends AuthManager {
	public constructor(
		protected readonly allowedAuthTypes: ArrayAllowedAuthTypes,
		private readonly accessTokenManager: AccessTokenManager,
	) {
		super(allowedAuthTypes as any);
	}

	public isAuthorized(authHeader?: string) {
		const [prefix, credentials] = this.getPrefixCredentials(authHeader);

		if (!prefix || !credentials) {
			return false;
		}

		if (!this.allowedAuthTypes.some(this.prefixAuthType[prefix])) {
			return false;
		}

		switch (prefix) {
			case "Discord":
				return this.isDiscordAuthorized(credentials);
			case "Bearer":
				return this.isRestAuthorized(credentials);
			default:
				return false;
		}
	}

	public getAuthData(authHeader?: string) {
		const [prefix, credentials] = this.getPrefixCredentials(authHeader);

		switch (prefix) {
			case "Discord":
				return this.getDiscordData(credentials);
			case "Bearer":
				return this.getRestData(credentials);
			default:
				return {};
		}
	}

	private isDiscordAuthorized(credentials: string) {
		const [, token] = credentials.split("#");

		if (token !== process.env.AUTH_API_BOT_TOKEN) return false;

		const discordData = this.getDiscordData(credentials);

		const { accountId, admin } = discordData;

		const results = [] as Array<boolean>;

		if ((this.allowedAuthTypes as Array<string>).includes("DISCORD_BOT")) {
			results.push(Object.keys(discordData).length === 0);
		}

		if ((this.allowedAuthTypes as Array<string>).includes("DISCORD_USER")) {
			results.push(Boolean(accountId));
		}

		if ((this.allowedAuthTypes as Array<string>).includes("DISCORD_ADMIN")) {
			results.push(Boolean(admin));
		}

		return results.some(Boolean);
	}

	private getDiscordData(credentials?: string): TokenData {
		if (!credentials) return {};

		const [dataString] = credentials.split("#");

		return JSON.parse(dataString);
	}

	private async isRestAuthorized(credentials: string) {
		if (!(await this.accessTokenManager.isValid(credentials))) {
			return false;
		}

		const { accountId, admin } = this.getRestData(credentials);

		const results = [] as Array<boolean>;

		if ((this.allowedAuthTypes as Array<string>).includes("REST_USER")) {
			results.push(Boolean(accountId));
		}

		if ((this.allowedAuthTypes as Array<string>).includes("REST_ADMIN")) {
			results.push(Boolean(admin));
		}

		return results.some(Boolean);
	}

	private getRestData(credentials?: string): TokenData {
		if (!credentials) return {};

		return this.accessTokenManager.getTokenData(credentials);
	}
}
