import type { AccessTokenManager } from "../adapters/access-token-manager";
import type {
	AccountUseCase,
	AccountRepository,
	CreateWithDiscordIdInput,
	GetByDiscordIdInput,
	AuthOutput,
	AccountEntity,
	RefreshInput,
} from "../models/account";
import type { DiscordUseCase } from "../models/discord";
import type {
	CreateMagicLinkInput,
	GetMagicLinkInput,
	MagicLinkRepository,
} from "../models/magic-link";
import type { RefreshTokenRepository } from "../models/refresh-token";

import { CustomError } from "../utils/error";
import { genId } from "../utils/id/gen-id";

import { StatusCodeEnum } from "../types/enums/status-code";

export class AccountUseCaseImplementation implements AccountUseCase {
	public constructor(
		private readonly accountRepository: AccountRepository,
		private readonly refreshTokenRepository: RefreshTokenRepository,
		private readonly magicLinkRepository: MagicLinkRepository,
		private readonly accessTokenManager: AccessTokenManager,

		private readonly discordUsecase: DiscordUseCase,
	) {}

	public async createWithDiscordId({ discordId }: CreateWithDiscordIdInput) {
		const { accountId } = await this.discordUsecase.createWithDiscordId({
			accountId: await genId(),
			discordId,
		});

		return this.accountRepository.createWithDiscordId({
			accountId,
			discordId,
		});
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
			throw new CustomError("Magic link not Found", StatusCodeEnum.NOT_FOUND);
		}

		const { accountId } = magicLink;

		const account = await this.accountRepository.getByAccountId(accountId);

		if (!account) {
			throw new CustomError("Account not Found", StatusCodeEnum.NOT_FOUND);
		}

		return this.genAuthData(account);
	}

	public async refresh(p: RefreshInput) {
		const refreshToken = await this.refreshTokenRepository.getByToken({
			token: p.refreshToken,
		});

		if (!refreshToken) {
			throw new CustomError("Magic link not Found", StatusCodeEnum.NOT_FOUND);
		}

		const { accountId } = refreshToken;

		const account = await this.accountRepository.getByAccountId(accountId);

		if (!account) {
			throw new CustomError("Account not Found", StatusCodeEnum.NOT_FOUND);
		}

		return this.genAuthData(account);
	}

	// Private

	private async genAuthData({
		accountId,
		admin,
	}: AccountEntity): Promise<AuthOutput> {
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
				admin: admin ? true : undefined,
			});

		return {
			accountId,
			accessToken,
			refreshToken,
			expiresAt,
		};
	}
}
