type AllowedAuthTypes = "BOT" | "REST";

interface AuthData {
	accountId?: string;
}

export abstract class AuthManager {
	public constructor(
		protected readonly allowedAuthTypes: Array<AllowedAuthTypes>,
		protected readonly adminOnly?: boolean,
	) {}

	public abstract isAuthorized(authHeader: string): Promise<boolean> | boolean;

	public abstract getAuthData(authHeader?: string): AuthData;
}
