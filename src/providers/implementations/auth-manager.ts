import { AuthManager } from "../../providers/auth-manager";

export class AuthManagerProvider extends AuthManager {
	public isAuthorized(authHeader?: string) {
		const [authType, credentials] = authHeader?.split(" ") || [];

		if (!authType || !credentials) {
			return false;
		}

		if (!(this.allowedAuthTypes as Array<string>).includes(authType)) {
			return false;
		}

		switch (authType) {
			case "BOT":
				return this.isBotAuthorized(credentials);
			case "BOT_ADM":
				return this.isBotAdmAuthorized(credentials);
			default:
				return false;
		}
	}

	public getAuthData(authHeader?: string) {
		const [authType, credentials] = authHeader?.split(" ") || [];

		switch (authType) {
			case "BOT":
			case "BOT_ADM":
				return this.getBotData(credentials);
			default:
				return {};
		}
	}

	private isBotAuthorized(credentials: string) {
		const [, token] = Buffer.from(credentials).toString("utf8").split("#");

		if (token !== process.env.API_BOT_TOKEN) return false;

		return true;
	}

	private isBotAdmAuthorized(credentials: string) {
		const [dataString, token] = Buffer.from(credentials)
			.toString("utf8")
			.split("#");

		if (token !== process.env.API_BOT_TOKEN) return false;

		const data = JSON.parse(dataString);

		if (!data.admin) return false;

		return true;
	}

	private getBotData(credentials?: string) {
		if (!credentials) return {};

		const [dataString] = Buffer.from(credentials).toString("utf8").split("#");

		return JSON.parse(dataString);
	}
}
