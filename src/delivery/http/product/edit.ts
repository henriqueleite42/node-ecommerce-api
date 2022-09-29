/* eslint-disable @typescript-eslint/no-magic-numbers */

import { ProductService } from "../../../factories/product";
import type { EditInput } from "../../../models/product";
import type { DeliveryManager } from "../../../providers/delivery-manager";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

export const edit = (server: DeliveryManager) => {
	server.addRoute<EditInput>(
		{
			method: "PATCH",
			path: "products",
		},
		route =>
			route
				.setAuth(new AuthManagerProvider(["DISCORD_USER"]))
				.setValidator(
					new ValidatorProvider([
						{
							key: "storeId",
							as: "accountId",
							loc: "auth",
							validations: [Validations.required, Validations.uuid],
						},
						{
							key: "productId",
							loc: "body",
							validations: [Validations.required, Validations.code],
						},
						{
							key: "name",
							loc: "body",
							validations: [Validations.productName],
						},
						{
							key: "description",
							loc: "body",
							validations: [Validations.productDescription],
						},
						{
							key: "color",
							loc: "body",
							validations: [Validations.color],
						},
						{
							key: "price",
							loc: "body",
							validations: [Validations.productPrice],
						},
						{
							key: "imageUrl",
							loc: "body",
							validations: [Validations.url],
						},
					]),
				)
				.setFunc(p => {
					const service = new ProductService().getInstance();

					return service.edit(p);
				}),
	);
};
