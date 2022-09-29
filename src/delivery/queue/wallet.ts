import { create } from "./wallet/create";
import { incrementBalance } from "./wallet/increment-balance";

export const wallet = {
	walletIncrementBalance: incrementBalance,
	walletCreate: create,
};
