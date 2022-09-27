import { AuthManager } from "../../providers/auth-manager";

export class AuthManagerProvider extends AuthManager {
	public isAuthorized(authHeader?: string) {
		const [authType, credentials] = authHeader?.split(" ") || [];

		if (!authType || !credentials) {
			return false;
		}

		if (
			!(this.allowedAuthTypes as Array<string>).includes(authType.toUpperCase())
		) {
			return false;
		}

		switch (authType) {
			case "BOT":
				return this.isBotAuthorized(credentials);
			default:
				return false;
		}
	}

	public getAuthData(authHeader?: string) {
		const [authType, credentials] = authHeader?.split(" ") || [];

		switch (authType) {
			case "Bot":
				return this.getBotData(credentials);
			default:
				return {};
		}
	}

	private isBotAuthorized(credentials: string) {
		const [, token] = credentials.split("#");

		if (token !== process.env.API_BOT_TOKEN) return false;

		if (this.adminOnly) {
			const { admin } = this.getBotData(credentials);

			return Boolean(admin);
		}

		return true;
	}

	private getBotData(credentials?: string) {
		if (!credentials) return {};

		const [dataString] = credentials.split("#");

		return JSON.parse(dataString);
	}
}
