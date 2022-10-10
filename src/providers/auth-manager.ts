/* eslint-disable @typescript-eslint/naming-convention */

import type { TokenData } from "../adapters/access-token-manager";

/**
 * DISCORD = Request from bot
 * REST = Request from frontend
 */
type AllowedPlatformAuthTypes = "DISCORD" | "REST";

/**
 * DISCORD_USER = Request from bot by a user that has an account
 * REST_USER = Request from frontend by a user that has an account
 */
type AllowedLoggedAuthTypes = "DISCORD_USER" | "REST_USER";

/**
 * DISCORD_ADMIN = Request from bot by a ADMIN that has an account
 * REST_ADMIN = Request from frontend by a ADMIN that has an account
 */
type AllowedAdminAuthTypes = "DISCORD_ADMIN" | "REST_ADMIN";

export type AAAAT = Array<AllowedAdminAuthTypes>;
export type AALAT = Array<AllowedLoggedAuthTypes>;
export type AALPAT = Array<AllowedPlatformAuthTypes>;

export type AllowedPrefixes = "Bearer" | "Discord";

export abstract class AuthManager {
	protected prefixAuthType: Record<AllowedPrefixes, (p: string) => boolean> = {
		Discord: p => p.startsWith("DISCORD"),
		Bearer: p => p.startsWith("REST"),
	};

	public constructor(
		protected readonly allowedAuthTypes: AAAAT | AALAT | AALPAT,
	) {}

	public abstract isAuthorized(
		authHeader: string | undefined,
	): Promise<boolean> | boolean;

	public abstract getAuthData(authHeader?: string): TokenData;

	protected getPrefixCredentials(authHeader?: string) {
		return (authHeader?.split(" ") || []) as [AllowedPrefixes, string];
	}
}
