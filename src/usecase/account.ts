import type { AccessTokenManager } from "../adapters/access-token-manager";
import type {
	AccountUseCase,
	AccountRepository,
	CreateWithDiscordIdInput,
	GetByDiscordIdInput,
	AuthOutput,
} from "../models/account";
import type {
	CreateMagicLinkInput,
	GetMagicLinkInput,
	MagicLinkRepository,
} from "../models/magic-link";
import type { RefreshTokenRepository } from "../models/refresh-token";

import { CustomError } from "../utils/error";

import { StatusCodeEnum } from "../types/enums/status-code";

export class AccountUseCaseImplementation implements AccountUseCase {
	public constructor(
		private readonly accountRepository: AccountRepository,
		private readonly refreshTokenRepository: RefreshTokenRepository,
		private readonly magicLinkRepository: MagicLinkRepository,
		private readonly accessTokenManager: AccessTokenManager,
	) {}

	public async createWithDiscordId(p: CreateWithDiscordIdInput) {
		const account = await this.accountRepository.getByDiscordId(p.discordId);

		if (account) {
			throw new CustomError(
				"An account with the same discordID already exists",
				StatusCodeEnum.CONFLICT,
			);
		}

		return this.accountRepository.createWithDiscordId(p);
	}

	public async getByDiscordId({ discordId }: GetByDiscordIdInput) {
		const account = await this.accountRepository.getByDiscordId(discordId);

		if (!account) {
			throw new CustomError("Not Found", StatusCodeEnum.NOT_FOUND);
		}

		return account;
	}

	public async createMagicLink(p: CreateMagicLinkInput) {
		const { token } = await this.magicLinkRepository.create(p);

		return { token };
	}

	public async signInWithMagicLink(p: GetMagicLinkInput) {
		const magicLink = await this.magicLinkRepository.get(p);

		if (!magicLink) {
			throw new CustomError("Not Found", StatusCodeEnum.NOT_FOUND);
		}

		const { accountId } = magicLink;

		return this.genAuthData(accountId);
	}

	private async genAuthData(accountId: string): Promise<AuthOutput> {
		let refreshToken: string;

		const oldRefreshToken = await this.refreshTokenRepository.getByAccountId({
			accountId,
		});

		if (oldRefreshToken) {
			refreshToken = oldRefreshToken.token;
		} else {
			const newRefreshToken = await this.refreshTokenRepository.create({
				accountId,
			});

			refreshToken = newRefreshToken.token;
		}

		const { accessToken, expiresAt } =
			await this.accessTokenManager.genAccessToken({
				accountId,
			});

		return {
			accountId,
			accessToken,
			refreshToken,
			expiresAt,
		};
	}
}
