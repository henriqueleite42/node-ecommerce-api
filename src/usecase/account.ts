/* eslint-disable @typescript-eslint/no-magic-numbers */
import type {
	AccountUseCase,
	AccountEntity,
	AccountRepository,
	IncrementBalanceInput,
} from "models/account";
import type { StoreRepository } from "models/store";

export class AccountUseCaseImplementation implements AccountUseCase {
	public constructor(
		private readonly accountRepository: AccountRepository,
		private readonly storeRepository: StoreRepository,
	) {}

	public async createWithDiscordId(p: Pick<AccountEntity, "discordId">) {
		const account = await this.accountRepository.getByDiscordId(p.discordId);

		if (account) {
			throw new Error("DUPLICATED_DISCORDID");
		}

		return this.accountRepository.createWithDiscordId(p);
	}

	public async getByDiscordId(discordId: string) {
		const account = await this.accountRepository.getByDiscordId(discordId);

		if (!account) {
			throw new Error("NOT_FOUND");
		}

		const stores = await this.storeRepository.getAllFromAccount({
			accountId: account.accountId,
			limit: 100,
		});

		return {
			...account,
			stores: stores.items,
		};
	}

	public async incrementBalance({ accountId, amount }: IncrementBalanceInput) {
		const { monetizzerProfit, gnFee, storeProfit } =
			this.getFeeTaxProfit(amount);

		await Promise.all([
			this.accountRepository.incrementBalance({
				accountId: "OFFICIAL",
				amount: monetizzerProfit,
			}),
			this.accountRepository.incrementBalance({
				accountId: "GERENCIANET",
				amount: gnFee,
			}),
			this.accountRepository.incrementBalance({
				accountId,
				amount: storeProfit,
			}),
		]);
	}

	// Internal methods

	private getFeeTaxProfit(value: number) {
		const SALE_FEE_PERCENTAGE = 5;
		const GN_FEE_PERCENTAGE = 1.19;

		const rawGnFee = parseFloat(((value * GN_FEE_PERCENTAGE) / 100).toFixed(2));

		const totalFee = parseFloat(
			((value * SALE_FEE_PERCENTAGE) / 100).toFixed(2),
		);

		const storeProfit = parseFloat((value - totalFee).toFixed(2));
		const gnFee = rawGnFee >= 0.01 ? rawGnFee : 0.01;
		const monetizzerProfit = parseFloat((totalFee - gnFee).toFixed(2));

		return {
			storeProfit,
			monetizzerProfit,
			gnFee,
		};
	}
}
