import type { WithdrawalMethodEnum } from "../types/enums/withdrawal-method";

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

export interface CreateInput {
	accountId: string;
}

export interface AddWWMInput extends AllWWMs {
	accountId: string;
}

export interface WalletRepository {
	incrementBalance: (p: IncrementBalanceInput) => Promise<void>;

	withdrawal: (p: WithdrawalInput) => Promise<void>;

	getById: (p: GetByIdInput) => Promise<WalletEntity | null>;

	create: (p: CreateInput) => Promise<WalletEntity>;

	addWWM: (p: AddWWMInput) => Promise<WalletEntity | null>;
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

export interface AddWWMPixInput extends Omit<WWMPix, "type"> {
	accountId: string;
}

export interface WalletUseCase {
	incrementBalance: (p: IncrementBalanceInput) => Promise<void>;

	adminWithdrawal: (p: AdminWithdrawalInput) => Promise<void>;

	create: (p: CreateInput) => Promise<WalletEntity>;

	addWWMPix: (p: AddWWMPixInput) => Promise<void>;
}
