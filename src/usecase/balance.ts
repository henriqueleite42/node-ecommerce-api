/* eslint-disable @typescript-eslint/no-magic-numbers */
import type {
	BalanceUseCase,
	BalanceRepository,
	IncrementBalanceInput,
	WithdrawalInput,
} from "models/balance";

export class BalanceUseCaseImplementation implements BalanceUseCase {
	public constructor(private readonly balanceRepository: BalanceRepository) {}

	public async incrementBalance({ accountId, amount }: IncrementBalanceInput) {
		const { monetizzerProfit, gnFee, storeProfit } =
			this.getFeeTaxProfit(amount);

		await Promise.all([
			this.balanceRepository.incrementBalance({
				accountId: "OFFICIAL",
				amount: monetizzerProfit,
			}),
			this.balanceRepository.incrementBalance({
				accountId: "GERENCIANET",
				amount: gnFee,
			}),
			this.balanceRepository.incrementBalance({
				accountId,
				amount: storeProfit,
			}),
		]);
	}

	public async withdrawal({ accountId, amount }: WithdrawalInput) {
		const balance = await this.balanceRepository.getById({ accountId });

		if (!balance || balance.balance < amount) {
			throw new Error("NOT_ENOUGH_FOUNDS");
		}

		await Promise.all([
			this.balanceRepository.incrementBalance({
				accountId: process.env.RAZAL_ACCOUNT_ID!,
				amount,
			}),
			this.balanceRepository.incrementBalance({
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
