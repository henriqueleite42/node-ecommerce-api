/* eslint-disable @typescript-eslint/no-magic-numbers */

import { ProductService } from "../../../factories/product";
import type { GetByIdInput } from "../../../models/product";
import type { DeliveryManager } from "../../../providers/delivery-manager";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

export const getById = (server: DeliveryManager) => {
	server.addRoute<GetByIdInput>(
		{
			method: "GET",
			path: "products",
		},
		route =>
			route
				.setAuth(new AuthManagerProvider(["DISCORD"]))
				.setValidator(
					new ValidatorProvider([
						{
							key: "storeId",
							loc: "query",
							validations: [Validations.required, Validations.uuid],
						},
						{
							key: "productId",
							loc: "query",
							validations: [Validations.required, Validations.code],
						},
					]),
				)
				.setFunc(p => {
					const service = new ProductService().getInstance();

					return service.getById(p);
				}),
	);
};
