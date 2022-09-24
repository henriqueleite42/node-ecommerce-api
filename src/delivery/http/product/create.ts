/* eslint-disable @typescript-eslint/no-magic-numbers */

/**
 *
 *
 * This file CANNOT use absolute paths!
 *
 *
 */

import { ProductService } from "factories/product";
import type { CreateProductInput, ProductUseCase } from "models/product";
import { Validations } from "providers/implementations/validations";

import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { LambdaProvider } from "../../../providers/implementations/lambda";
import { ValidatorProvider } from "../../../providers/implementations/validator";

import { StatusCodeEnum } from "../../../types/enums/status-code";

const httpManager = new LambdaProvider<ProductUseCase, CreateProductInput>({
	method: "POST",
	path: "products",
	statusCode: StatusCodeEnum.CREATED,
})
	.setAuth(new AuthManagerProvider(["BOT"]))
	.setValidation(
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
				validations: [Validations.required, Validations.productDescription],
			},
			{
				key: "color",
				loc: "body",
				validations: [Validations.color],
			},
			{
				key: "price",
				loc: "body",
				validations: [Validations.money],
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
					Validations.array,
					Validations.minLength(1),
					Validations.maxLength(2),
					Validations.arrOfObj([
						{
							key: "name",
							validations: [Validations.required, Validations.variationName],
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
							validations: [Validations.required, Validations.money],
						},
					]),
					Validations.arrayUnique("name"),
				],
			},
			{
				key: "contents",
				loc: "body",
				validations: [
					Validations.array,
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
	.setService(new ProductService());

/**
 *
 * Func
 *
 */

export const func = httpManager.setFunc("create").getFunc();

/**
 *
 * Handler
 *
 */

export const create = httpManager.getHandler(__dirname, __filename);
