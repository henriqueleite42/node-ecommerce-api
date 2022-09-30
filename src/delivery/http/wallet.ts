import type { DomainInput } from "./types";
import { addWWMPix } from "./wallet/add-wwm-pix";
import { adminWithdrawal } from "./wallet/admin-withdrawal";

export const walletDomain = async ({ server, secretsLoader }: DomainInput) => {
	await secretsLoader.loadSecrets("monetizzer/auth");

	addWWMPix(server);
	adminWithdrawal(server);
};
