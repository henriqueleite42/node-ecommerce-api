import { create } from "./queue/wallet/create";
import { incrementBalance } from "./queue/wallet/increment-balance";

export const wallet = {
	walletIncrementBalance: incrementBalance,
	walletCreate: create,
};
