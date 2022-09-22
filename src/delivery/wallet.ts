import { adminWithdrawal } from "./http/wallet/admin-withdrawal/handler";
import { incrementBalance } from "./queue/wallet/increment-balance/handler";

export const wallet = {
	walletIncrementBalance: incrementBalance,
	walletAdminWithdrawal: adminWithdrawal,
};
