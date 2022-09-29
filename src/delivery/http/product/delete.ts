/* eslint-disable @typescript-eslint/no-magic-numbers */

import { ProductService } from "../../../factories/product";
import type { DeleteInput } from "../../../models/product";
import type { DeliveryManager } from "../../../providers/delivery-manager";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

export const del = (server: DeliveryManager) => {
	server.addRoute<DeleteInput>(
		{
			method: "DELETE",
			path: "products",
		},
		route =>
			route
				.setAuth(new AuthManagerProvider(["DISCORD_USER"]))
				.setValidator(
					new ValidatorProvider([
						{
							key: "storeId",
							loc: "auth",
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

					return service.delete(p);
				}),
	);
};
