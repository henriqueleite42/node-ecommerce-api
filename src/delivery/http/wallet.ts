import type { DeliveryManager } from "../../providers/delivery-manager";

import { addWWMPix } from "./wallet/add-wwm-pix";
import { adminWithdrawal } from "./wallet/admin-withdrawal";

export const walletDomain = (server: DeliveryManager) => {
	server.addSecretsToLoad("monetizzer/auth");
	server.addSecretsToLoad("monetizzer/wallet");

	addWWMPix(server);
	adminWithdrawal(server);
};
