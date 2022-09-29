import { SaleService } from "../../../factories/sale";
import type { DeliveryManager } from "../../../providers/delivery-manager";
import { ValidatorProvider } from "../../../providers/implementations/validator";

export const processPixPayment = (server: DeliveryManager) => {
	server.addRoute<any>(
		{
			method: "POST",
			path: "sales/webhooks/pix",
		},
		route =>
			route
				.setValidator(
					new ValidatorProvider([
						{
							key: "body",
						},
					]),
				)
				.setFunc(p => {
					const service = new SaleService().getInstance();

					return service.processPixPayment(p);
				}),
	);
};
