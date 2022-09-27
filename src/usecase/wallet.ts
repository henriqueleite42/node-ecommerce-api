/* eslint-disable @typescript-eslint/no-magic-numbers */

import type {
	WalletUseCase,
	WalletRepository,
	IncrementBalanceInput,
	AdminWithdrawalInput,
	CreateInput,
	AddWWMPixInput,
} from "../models/wallet";

import { CustomError } from "../utils/error";

import { StatusCodeEnum } from "../types/enums/status-code";
import { WithdrawalMethodEnum } from "../types/enums/withdrawal-method";

export class WalletUseCaseImplementation implements WalletUseCase {
	public constructor(private readonly walletRepository: WalletRepository) {}

	public async create(p: CreateInput) {
		const wallet = await this.walletRepository.getById(p);

		if (wallet) {
			throw new CustomError(
				"Account already has a wallet",
				StatusCodeEnum.NOT_FOUND,
			);
		}

		return this.walletRepository.create(p);
	}

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
			throw new CustomError("Not enough funds", StatusCodeEnum.NOT_ACCEPTABLE);
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

	public async addWWMPix({ accountId, pixKey }: AddWWMPixInput) {
		const wallet = await this.walletRepository.getById({ accountId });

		if (!wallet) {
			throw new CustomError("Wallet not found", StatusCodeEnum.NOT_FOUND);
		}

		const type = WithdrawalMethodEnum.PIX;

		const isDuplicatedWWM = wallet.withdrawalMethods.find(
			wwm => wwm.type === type && wwm.pixKey === pixKey,
		);

		if (isDuplicatedWWM) {
			throw new CustomError("Duplicated WWM", StatusCodeEnum.CONFLICT);
		}

		await this.walletRepository.addWWM({
			accountId,
			type,
			pixKey,
		});
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
