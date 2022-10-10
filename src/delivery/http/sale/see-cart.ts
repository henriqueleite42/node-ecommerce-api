/* eslint-disable @typescript-eslint/no-magic-numbers */

import { SaleService } from "../../../factories/sale";
import type { GetByClientIdStatusInput } from "../../../models/sale";
import type { HttpManager } from "../../../providers/http-manager";
import { Transform } from "../../../providers/implementations/transform";
import { Validations } from "../../../providers/implementations/validations";

import { SalesStatusEnum } from "../../../types/enums/sale-status";

export const seeCart = (server: HttpManager) => {
	server.addRoute<GetByClientIdStatusInput>(
		{
			method: "GET",
			path: "sales/cart",
			auth: ["DISCORD_USER"],
			validations: [
				{
					key: "clientId",
					as: "accountId",
					loc: "auth",
					validations: [Validations.required, Validations.id],
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
			],
		},
		route =>
			route.setFunc(p => {
				const service = new SaleService().getInstance();

				return service.getByClientIdStatus(p);
			}),
	);
};
