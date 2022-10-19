import type { AccessTokenManager } from "../adapters/access-token-manager";
import type { DiscordManager } from "../adapters/discord-manager";
import type {
	AccountUseCase,
	AccountRepository,
	CreateWithDiscordIdInput,
	GetByDiscordIdInput,
	AuthOutput,
	CreateAccountWithDiscordInput,
	AccountEntity,
	RefreshInput,
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
	private readonly necessaryDiscordScopes = [
		"identify",
		"email",
		"gdm.join",
		"guilds",
		"guilds.members.read",
	] as Array<string>;

	public constructor(
		private readonly accountRepository: AccountRepository,
		private readonly refreshTokenRepository: RefreshTokenRepository,
		private readonly magicLinkRepository: MagicLinkRepository,
		private readonly accessTokenManager: AccessTokenManager,
		private readonly discordManager: DiscordManager,
	) {}

	public async createWithDiscord({ code }: CreateAccountWithDiscordInput) {
		const { scopes, accessToken, refreshToken, expiresAt } =
			await this.discordManager.exchangeCode(code);

		if (!this.necessaryDiscordScopes.every(s => scopes.includes(s))) {
			throw new CustomError("Missing scopes", StatusCodeEnum.BAD_REQUEST);
		}

		const { id } = await this.discordManager.getUserData(accessToken);

		const oldAccount = await this.accountRepository.getByDiscordId(id);

		if (oldAccount) {
			return this.genAuthData(oldAccount);
		}

		const account = await this.accountRepository.createWithDiscord({
			discordId: id,
			discord: {
				accessToken,
				refreshToken,
				expiresAt,
			},
		});

		return this.genAuthData(account);
	}

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
