import { addWWMPix } from "./http/wallet/add-wwm-pix";
import { adminWithdrawal } from "./http/wallet/admin-withdrawal";
import { create } from "./queue/wallet/create";
import { incrementBalance } from "./queue/wallet/increment-balance";

export const wallet = {
	walletAddWWMPix: addWWMPix,
	walletIncrementBalance: incrementBalance,
	walletCreate: create,
	walletAdminWithdrawal: adminWithdrawal,
};
