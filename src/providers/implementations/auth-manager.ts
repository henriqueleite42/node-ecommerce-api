import type {
	AccessTokenManager,
	TokenData,
} from "../../adapters/access-token-manager";
import type {
	AAAAT,
	AALAT,
	AALPAT,
	AllowedPrefixes,
} from "../../providers/auth-manager";
import { AuthManager } from "../../providers/auth-manager";

export class AuthManagerProvider extends AuthManager {
	public constructor(
		protected readonly allowedAuthTypes: AAAAT | AALAT | AALPAT,
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
				return this.isDiscordAuthorized(prefix, credentials);
			case "Bearer":
				return this.isRestAuthorized(prefix, credentials);
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

	private isDiscordAuthorized(prefix: AllowedPrefixes, credentials: string) {
		const [, token] = credentials.split("#");

		if (token !== process.env.API_BOT_TOKEN) return false;

		const { accountId, admin } = this.getDiscordData(credentials);

		if (prefix.endsWith("USER")) {
			return Boolean(accountId);
		}

		if (prefix.endsWith("ADMIN")) {
			return Boolean(admin);
		}

		return true;
	}

	private getDiscordData(credentials?: string): TokenData {
		if (!credentials) return {};

		const [dataString] = credentials.split("#");

		return JSON.parse(dataString);
	}

	private async isRestAuthorized(prefix: AllowedPrefixes, credentials: string) {
		if (!(await this.accessTokenManager.isValid(credentials))) {
			return false;
		}

		const { accountId, admin } = this.getRestData(credentials);

		if (prefix.endsWith("USER")) {
			return Boolean(accountId);
		}

		if (prefix.endsWith("ADMIN")) {
			return Boolean(admin);
		}

		return true;
	}

	private getRestData(credentials?: string): TokenData {
		if (!credentials) return {};

		return this.accessTokenManager.getTokenData(credentials);
	}
}
