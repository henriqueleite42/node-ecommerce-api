export interface TokenData {
	accountId?: string;
	admin?: boolean;
}

export interface GenAccessTokenInput {
	accountId: string;
	admin?: true;
}

export interface GenAccessTokenOutput {
	accessToken: string;
	expiresAt: string;
}

export interface AccessTokenManager {
	genAccessToken: (p: GenAccessTokenInput) => Promise<GenAccessTokenOutput>;

	isValid: (token: string) => Promise<boolean>;

	getTokenData: (token: string) => TokenData;
}
