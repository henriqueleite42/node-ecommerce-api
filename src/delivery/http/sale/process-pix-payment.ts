import { SaleService } from "../../../factories/sale";
import type { HttpManager } from "../../../providers/http-manager";

export const processPixPayment = (server: HttpManager) => {
	server.addRoute<any>(
		{
			method: "POST",
			path: "sales/webhooks/pix",
			validations: [
				{
					key: "body",
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new SaleService().getInstance();

				return service.processPixPayment(p);
			}),
	);
};
