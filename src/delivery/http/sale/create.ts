/* eslint-disable @typescript-eslint/no-magic-numbers */

/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { SaleService } from "../../../factories/sale";
import type { CreateSaleInput } from "../../../models/sale";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

import { StatusCodeEnum } from "../../../types/enums/status-code";

export const create = (server: HttpManager) => {
	server.addRoute<CreateSaleInput>(
		{
			method: "POST",
			path: "sales",
			statusCode: StatusCodeEnum.CREATED,
			auth: ["DISCORD_USER"],
			validations: [
				{
					key: "storeId",
					loc: "body",
					validations: [Validations.required, Validations.id],
				},
				{
					key: "clientId",
					as: "accountId",
					loc: "auth",
					validations: [Validations.required, Validations.id],
				},
				{
					key: "origin",
					loc: "body",
					validations: [
						Validations.required,
						Validations.obj([
							{
								key: "platform",
								validations: [Validations.required, Validations.platform],
							},
							{
								key: "id",
								validations: [Validations.required, Validations.string],
							},
						]),
					],
				},
				{
					key: "products",
					loc: "body",
					validations: [
						Validations.required,
						Validations.minLength(1),
						Validations.maxLength(1),
						Validations.arrOfObj([
							{
								key: "productId",
								validations: [Validations.required, Validations.code],
							},
							{
								key: "variationId",
								validations: [Validations.required, Validations.code],
							},
						]),
					],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new SaleService().getInstance();

				return service.create(p);
			}),
	);
};
