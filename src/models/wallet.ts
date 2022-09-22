import type { WithdrawalMethodEnum } from "types/enums/withdrawal-method";

interface BaseWWM {
	type: WithdrawalMethodEnum;
}

export interface WWMPix extends BaseWWM {
	type: WithdrawalMethodEnum.PIX;
	pixKey: string;
}

export type AllWWMs = WWMPix;

export interface WalletEntity {
	accountId: string;
	balance: number;
	withdrawalMethods: Array<AllWWMs>;
}

/**
 *
 *
 * Repository
 *
 *
 */

export interface IncrementBalanceInput {
	accountId: string;
	amount: number;
}

export interface WithdrawalInput {
	accountId: string;
	amount: number;
}

export type GetByIdInput = Pick<WalletEntity, "accountId">;

export interface WalletRepository {
	incrementBalance: (p: IncrementBalanceInput) => Promise<void>;

	withdrawal: (p: WithdrawalInput) => Promise<void>;

	getById: (p: GetByIdInput) => Promise<WalletEntity | null>;
}

/**
 *
 *
 * Usecase
 *
 *
 */

export interface AdminWithdrawalInput {
	adminId: string;
	accountId: string;
	amount: number;
}

export interface WalletUseCase {
	incrementBalance: (p: IncrementBalanceInput) => Promise<void>;

	adminWithdrawal: (p: AdminWithdrawalInput) => Promise<void>;
}
