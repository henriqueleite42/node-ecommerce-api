/* eslint-disable @typescript-eslint/no-magic-numbers */

import { ProductService } from "../../../factories/product";
import type { GetProductsByTypeInput } from "../../../models/product";
import type { DeliveryManager } from "../../../providers/delivery-manager";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { Transform } from "../../../providers/implementations/transform";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

export const getPaginated = (server: DeliveryManager) => {
	server.addRoute<GetProductsByTypeInput>(
		{
			method: "GET",
			path: "products/paginated",
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
							key: "type",
							loc: "query",
							validations: [Validations.required, Validations.productType],
						},
						{
							key: "limit",
							loc: "query",
							validations: [Validations.required, Validations.limit],
							transform: [Transform.int],
						},
						{
							key: "continueFrom",
							loc: "query",
							validations: [Validations.cursor],
						},
					]),
				)
				.setFunc(p => {
					const service = new ProductService().getInstance();

					return service.getProductsByType(p);
				}),
	);
};
