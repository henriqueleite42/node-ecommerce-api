/* eslint-disable @typescript-eslint/naming-convention */

import { V4, decode } from "paseto";

import type {
	AccessTokenManager,
	GenAccessTokenInput,
	GenAccessTokenOutput,
	TokenData,
} from "../access-token-manager";

export class PasetoAdapter implements AccessTokenManager {
	private readonly paseto: typeof V4;

	private readonly privateKey: string;

	// eslint-disable-next-line @typescript-eslint/no-magic-numbers
	private readonly validFor = 15 * 60 * 1000;

	private readonly defaultOptions = {
		issuer: "https://maite.chat",
		audience: "https://maite.chat",
	};

	public constructor() {
		this.paseto = V4;

		this.privateKey = process.env.PASETO_PRIVATE_KEY!;
	}

	public async genAccessToken(
		p: GenAccessTokenInput,
	): Promise<GenAccessTokenOutput> {
		const expiresIn = (new Date().getTime() + this.validFor).toString();

		const token = await this.paseto.sign(p, this.privateKey, {
			...this.defaultOptions,
			expiresIn,
		});

		return {
			accessToken: token,
			expiresAt: new Date(expiresIn).toISOString(),
		};
	}

	public async isValid(token: string) {
		try {
			await this.paseto.verify(token, this.privateKey, this.defaultOptions);

			return true;
		} catch (err: any) {
			return false;
		}
	}

	public getTokenData(token: string) {
		return decode(token).payload as TokenData;
	}
}
