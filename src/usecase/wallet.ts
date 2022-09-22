/* eslint-disable @typescript-eslint/no-magic-numbers */

import type {
	WalletUseCase,
	WalletRepository,
	IncrementBalanceInput,
	AdminWithdrawalInput,
} from "models/wallet";

export class WalletUseCaseImplementation implements WalletUseCase {
	public constructor(private readonly walletRepository: WalletRepository) {}

	public async incrementBalance({ accountId, amount }: IncrementBalanceInput) {
		const { monetizzerProfit, gnFee, storeProfit } =
			this.getFeeTaxProfit(amount);

		await Promise.all([
			this.walletRepository.incrementBalance({
				accountId: "OFFICIAL",
				amount: monetizzerProfit,
			}),
			this.walletRepository.incrementBalance({
				accountId: "GERENCIANET",
				amount: gnFee,
			}),
			this.walletRepository.incrementBalance({
				accountId,
				amount: storeProfit,
			}),
		]);
	}

	public async adminWithdrawal({
		adminId,
		accountId,
		amount,
	}: AdminWithdrawalInput) {
		const wallet = await this.walletRepository.getById({ accountId });

		if (!wallet || wallet.balance < amount) {
			throw new Error("NOT_ENOUGH_FUNDS");
		}

		await Promise.all([
			this.walletRepository.incrementBalance({
				accountId: adminId,
				amount,
			}),
			this.walletRepository.incrementBalance({
				accountId,
				amount: -amount,
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
