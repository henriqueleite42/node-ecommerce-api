/* eslint-disable @typescript-eslint/no-magic-numbers */

import { ProductService } from "../../../factories/product";
import type { CreateProductInput } from "../../../models/product";
import type { DeliveryManager } from "../../../providers/delivery-manager";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

import { StatusCodeEnum } from "../../../types/enums/status-code";

export const create = (server: DeliveryManager) => {
	server.addRoute<CreateProductInput>(
		{
			method: "POST",
			path: "products",
			statusCode: StatusCodeEnum.CREATED,
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
							key: "type",
							loc: "body",
							validations: [Validations.required, Validations.productType],
						},
						{
							key: "deliveryMethod",
							loc: "body",
							validations: [Validations.required, Validations.deliveryMethod],
						},
						{
							key: "name",
							loc: "body",
							validations: [Validations.required, Validations.productName],
						},
						{
							key: "description",
							loc: "body",
							validations: [
								Validations.required,
								Validations.productDescription,
							],
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
						{
							key: "variations",
							loc: "body",
							validations: [
								Validations.minLength(1),
								Validations.maxLength(5),
								Validations.arrOfObj([
									{
										key: "name",
										validations: [
											Validations.required,
											Validations.variationName,
										],
									},
									{
										key: "description",
										validations: [
											Validations.required,
											Validations.variationDescription,
										],
									},
									{
										key: "price",
										validations: [
											Validations.required,
											Validations.productPrice,
										],
									},
								]),
								Validations.arrayUnique("name"),
							],
						},
						{
							key: "contents",
							loc: "body",
							validations: [
								Validations.minLength(1),
								Validations.maxLength(500),
								Validations.arrOfObj([
									{
										key: "type",
										validations: [Validations.required, Validations.mediaType],
									},
									{
										key: "mediaUrl",
										validations: [Validations.required, Validations.url],
									},
								]),
								Validations.arrayUnique("mediaUrl"),
							],
						},
					]),
				)
				.setFunc(p => {
					const service = new ProductService().getInstance();

					return service.create(p);
				}),
	);
};
