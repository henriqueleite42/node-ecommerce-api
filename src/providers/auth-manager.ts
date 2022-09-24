type AllowedAuthTypes = "BOT" | "REST";
type AllowedAdmAuthTypes = "BOT_ADM" | "REST_ADM";

export abstract class AuthManager {
	public constructor(
		protected readonly allowedAuthTypes:
			| Array<AllowedAdmAuthTypes>
			| Array<AllowedAuthTypes>,
	) {}

	public abstract isAuthorized(authHeader: string): Promise<boolean> | boolean;
}
