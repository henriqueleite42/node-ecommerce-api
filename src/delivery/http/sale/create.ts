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
import type { DeliveryManager } from "../../../providers/delivery-manager";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

import { StatusCodeEnum } from "../../../types/enums/status-code";

export const create = (server: DeliveryManager) => {
	server.addRoute<CreateSaleInput>(
		{
			method: "POST",
			path: "sales",
			statusCode: StatusCodeEnum.CREATED,
		},
		route =>
			route
				.setAuth(new AuthManagerProvider(["DISCORD_USER"]))
				.setValidator(
					new ValidatorProvider([
						{
							key: "storeId",
							loc: "body",
							validations: [Validations.required, Validations.uuid],
						},
						{
							key: "clientId",
							as: "accountId",
							loc: "auth",
							validations: [Validations.required, Validations.uuid],
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
					]),
				)
				.setFunc(p => {
					const service = new SaleService().getInstance();

					return service.create(p);
				}),
	);
};
