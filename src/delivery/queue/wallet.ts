import { create } from "./wallet/create";
import { decreasePendingBalance } from "./wallet/decrease-pending-balance";
import { incrementPendingBalance } from "./wallet/increment-pending-balance";
import { releasePendingBalance } from "./wallet/release-pending-balance";

export const wallet = {
	walletCreate: create,
	walletDecreasePendingBalance: decreasePendingBalance,
	walletIncrementPendingBalance: incrementPendingBalance,
	walletReleasePendingBalance: releasePendingBalance,
};
