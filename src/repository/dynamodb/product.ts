/* eslint-disable @typescript-eslint/naming-convention */

import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { cleanObj } from "@techmmunity/utils";

import type {
	CreateInput,
	EditInput,
	GetByIdInput,
	GetManyByIdInput,
	GetProductsByTypeInput,
	ProductEntity,
	ProductRepository,
} from "../../models/product";

import { DynamodbRepository } from ".";

import { genCode } from "../../utils/id/gen-code";

import type { DeliveryMethodEnum } from "../../types/enums/delivery-method";
import type { ProductTypeEnum } from "../../types/enums/product-type";

export interface ProductTable {
	productId: string;
	storeId: string;
	type: ProductTypeEnum;
	name: string;
	description: string;
	color?: string;
	price?: number;
	imagePath?: string;
	variations: Array<{
		id: string;
		name: string;
		description: string;
		price: number;
	}>;
	deliveryMethod: DeliveryMethodEnum;
	createdAt: string;

	storeId_type: string;
	storeId_productId: string;
	createdAt_productId: string;
}

export class ProductRepositoryDynamoDB
	extends DynamodbRepository<ProductTable, ProductEntity>
	implements ProductRepository
{
	protected readonly tableName = "products";

	public async create({
		storeId,
		type,
		name,
		description,
		color,
		price,
		variations,
		deliveryMethod,
	}: CreateInput) {
		const item: ProductEntity = {
			productId: genCode(),
			storeId,
			type,
			name,
			description,
			color,
			price,
			variations: variations?.map(v => ({
				...v,
				id: genCode(),
			})),
			deliveryMethod,
			createdAt: new Date(),
		};

		await this.dynamodb.send(
			new PutItemCommand({
				// eslint-disable-next-line @typescript-eslint/naming-convention
				TableName: this.tableName,
				// eslint-disable-next-line @typescript-eslint/naming-convention
				Item: marshall(this.entityToTable(item)),
			}),
		);

		return item;
	}

	public edit({ productId, storeId, ...data }: EditInput) {
		return this.update(
			this.indexStoreIdProductId({
				productId,
				storeId,
			}).Key,
			data,
		);
	}

	public getProductsByType({
		limit,
		continueFrom,
		...keys
	}: GetProductsByTypeInput) {
		return this.getMultipleItems(
			this.indexStoreIdType(keys),
			limit,
			continueFrom,
		);
	}

	public getById(keys: GetByIdInput) {
		return this.getSingleItem(this.indexStoreIdProductId(keys));
	}

	public getManyById(keys: GetManyByIdInput) {
		return this.getMultipleItemsById({
			Keys: keys.map(
				({ storeId, productId }) =>
					this.indexStoreIdProductId({
						productId,
						storeId,
					}).Key,
			),
		});
	}

	// Keys

	private indexStoreIdProductId({
		storeId,
		productId,
	}: Pick<ProductEntity, "productId" | "storeId">) {
		return {
			KeyConditionExpression: "#storeId_productId = :storeId_productId",
			ExpressionAttributeNames: {
				"#storeId_productId": "storeId_productId",
			},
			ExpressionAttributeValues: marshall({
				":storeId_productId": `STORE#${storeId}#PRODUCT#${productId}`,
			}),
			Key: marshall({
				storeId_productId: `STORE#${storeId}#PRODUCT#${productId}`,
			}),
		};
	}

	private indexStoreIdType({
		storeId,
		type,
	}: Pick<ProductEntity, "storeId" | "type">) {
		return {
			IndexName: "StoreIdTypeCreatedAtProductId",
			KeyConditionExpression: "#storeId_type = :storeId_type",
			ExpressionAttributeNames: {
				"#storeId_type": "storeId_type",
			},
			ExpressionAttributeValues: marshall({
				":storeId_type": `STORE#${storeId}#TYPE#${type}`,
			}),
			Key: marshall({
				storeId_type: `STORE#${storeId}#TYPE#${type}`,
			}),
		};
	}

	// Mappers

	protected entityToTable(
		entity: Partial<ProductEntity>,
	): Partial<ProductTable> {
		const productId = entity.productId
			? `PRODUCT#${entity.productId}`
			: undefined;
		const storeId = entity.storeId ? `STORE#${entity.storeId}` : undefined;
		const type = entity.type
			? (`TYPE#${entity.type}` as ProductTypeEnum)
			: undefined;
		const createdAt = entity.createdAt?.toISOString();

		return cleanObj({
			productId,
			storeId,
			type,
			name: entity.name,
			description: entity.description,
			color: entity.color,
			price: entity.price,
			variations: entity.variations,
			deliveryMethod: entity.deliveryMethod,
			imagePath: entity.imageUrl,
			createdAt,

			storeId_type: storeId && type ? `${storeId}#${type}` : undefined,
			storeId_productId:
				storeId && productId ? `${storeId}#${productId}` : undefined,
			createdAt_productId:
				createdAt && productId ? `${createdAt}#${productId}` : undefined,
		});
	}

	protected tableToEntity(table: ProductTable): ProductEntity {
		return {
			productId: table.productId.replace("PRODUCT#", ""),
			storeId: table.storeId.replace("STORE#", ""),
			type: table.type.replace("TYPE#", "") as ProductTypeEnum,
			name: table.name,
			description: table.description,
			color: table.color,
			price: table.price,
			imageUrl: table.imagePath
				? `${process.env.IMAGES_PREFIX_URL}/${table.imagePath}`
				: undefined,
			variations: table.variations,
			deliveryMethod: table.deliveryMethod,
			createdAt: new Date(table.createdAt),
		};
	}
}
