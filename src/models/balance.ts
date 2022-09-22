import type { WithdrawalMethodEnum } from "types/enums/withdrawal-method";

interface BaseBWM {
	type: WithdrawalMethodEnum;
}

export interface BWMPix extends BaseBWM {
	type: WithdrawalMethodEnum.PIX;
	pixKey: string;
}

export type AllBWMs = BWMPix;

export interface BalanceEntity {
	accountId: string;
	balance: number;
	withdrawalMethods: Array<AllBWMs>;
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

export type GetByIdInput = Pick<BalanceEntity, "accountId">;

export interface BalanceRepository {
	incrementBalance: (p: IncrementBalanceInput) => Promise<void>;

	withdrawal: (p: WithdrawalInput) => Promise<void>;

	getById: (p: GetByIdInput) => Promise<BalanceEntity | null>;
}

/**
 *
 *
 * Usecase
 *
 *
 */

export interface BalanceUseCase {
	incrementBalance: (p: IncrementBalanceInput) => Promise<void>;

	withdrawal: (p: WithdrawalInput) => Promise<void>;
}
