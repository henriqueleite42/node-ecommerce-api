import { adminWithdrawal } from "./http/wallet/admin-withdrawal/handler";
import { create } from "./queue/wallet/create/handler";
import { incrementBalance } from "./queue/wallet/increment-balance/handler";

export const wallet = {
	walletIncrementBalance: incrementBalance,
	walletCreate: create,
	walletAdminWithdrawal: adminWithdrawal,
};
