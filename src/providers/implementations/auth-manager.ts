import type { AllowedPrefixes, AuthData } from "../../providers/auth-manager";
import { AuthManager } from "../../providers/auth-manager";

export class AuthManagerProvider extends AuthManager {
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
			default:
				return false;
		}
	}

	public getAuthData(authHeader?: string) {
		const [prefix, credentials] = this.getPrefixCredentials(authHeader);

		switch (prefix) {
			case "Discord":
				return this.getDiscordData(credentials);
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

	private getDiscordData(credentials?: string): AuthData {
		if (!credentials) return {};

		const [dataString] = credentials.split("#");

		return JSON.parse(dataString);
	}
}
