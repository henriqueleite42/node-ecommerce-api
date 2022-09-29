/* eslint-disable @typescript-eslint/no-magic-numbers */

import { SaleService } from "../../../factories/sale";
import type { GetByClientIdStatusInput } from "../../../models/sale";
import type { DeliveryManager } from "../../../providers/delivery-manager";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { Transform } from "../../../providers/implementations/transform";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

import { SalesStatusEnum } from "../../../types/enums/sale-status";

export const seeCart = (server: DeliveryManager) => {
	server.addRoute<GetByClientIdStatusInput>(
		{
			method: "GET",
			path: "sales/cart",
		},
		route =>
			route
				.setAuth(new AuthManagerProvider(["DISCORD_USER"]))
				.setValidator(
					new ValidatorProvider([
						{
							key: "clientId",
							as: "accountId",
							loc: "auth",
							validations: [Validations.required, Validations.uuid],
						},
						{
							key: "status",
							transform: [Transform.default(SalesStatusEnum.IN_CART)],
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
							validations: [Validations.required, Validations.cursor],
						},
					]),
				)
				.setFunc(p => {
					const service = new SaleService().getInstance();

					return service.getByClientIdStatus(p);
				}),
	);
};
