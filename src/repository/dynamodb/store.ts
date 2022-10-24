/* eslint-disable capitalized-comments */
/* eslint-disable multiline-comment-style */
/* eslint-disable @typescript-eslint/naming-convention */

import {
	GetItemCommand,
	PutItemCommand,
	UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { cleanObj } from "@techmmunity/utils";

import type {
	ModifyProductTypeInput,
	CreateInput,
	EditInput,
	GetByIdInput,
	GetByNameInput,
	GetManyByIdInput,
	StoreEntity,
	StoreRepository,
	CreateTopStoresEntityInput,
	TopStoresOutput,
} from "../../models/store";

import { DynamodbRepository } from ".";

import type { GenderEnum } from "../../types/enums/gender";
import type { ProductTypeEnum } from "../../types/enums/product-type";

export interface StoreTable {
	storeId: string; // Same as AccountId
	accountId: string;
	productTypes: Array<ProductTypeEnum>;
	gender: GenderEnum;
	name: string;
	description?: string;
	color?: string;
	bannerPath?: string;
	avatarPath?: string;
	createdAt: string;

	// Only used by the top stores
	// storeId: "TOP_STORES";
	imageUrl?: string;
	stores?: Array<{
		storeId: string;
		storeName: string;
		gender: GenderEnum;
	}>;
}

export class StoreRepositoryDynamoDB
	extends DynamodbRepository<StoreTable, StoreEntity>
	implements StoreRepository
{
	protected readonly tableName = "stores";

	public async create({
		accountId,
		gender,
		name,
		description,
		color,
	}: CreateInput) {
		const item: StoreEntity = {
			storeId: accountId,
			accountId,
			productTypes: [],
			gender,
			name,
			description,
			color,
			createdAt: new Date(),
		};

		await this.dynamodb.send(
			new PutItemCommand({
				TableName: this.tableName,
				Item: marshall(this.entityToTable(item)),
			}),
		);

		return item;
	}

	public edit({ storeId, ...data }: EditInput) {
		return this.update(
			this.indexStoreId({
				storeId,
			}).Key,
			data,
		);
	}

	public async addProductType({
		storeId,
		productType,
	}: ModifyProductTypeInput) {
		await this.dynamodb.send(
			new UpdateItemCommand({
				TableName: this.tableName,
				UpdateExpression:
					"SET #productTypes = list_append(#productTypes, :productType)",
				ConditionExpression: "NOT contains(#productTypes, :productType)",
				ExpressionAttributeNames: {
					"#productTypes": "productTypes",
				},
				ExpressionAttributeValues: marshall({
					":productType": productType,
				}),
				Key: marshall({
					storeId: `STORE#${storeId}`,
				}),
			}),
		);
	}

	public async removeProductType({
		storeId,
		productType,
	}: ModifyProductTypeInput) {
		await this.dynamodb.send(
			new UpdateItemCommand({
				TableName: this.tableName,
				UpdateExpression: "DELETE #productTypes :productType",
				ExpressionAttributeNames: {
					"#productTypes": "productTypes",
				},
				ExpressionAttributeValues: marshall({
					":productType": productType,
				}),
				Key: marshall({
					storeId: `STORE#${storeId}`,
				}),
			}),
		);
	}

	public getById(keys: GetByIdInput) {
		return this.getSingleItem(this.indexStoreId(keys));
	}

	public getManyById(keys: GetManyByIdInput) {
		return this.getMultipleItemsById({
			Keys: keys.map(k => this.indexStoreId(k).Key),
		});
	}

	public getByName(keys: GetByNameInput) {
		return this.getSingleItem(this.indexName(keys));
	}

	public async createTopStores({
		imageUrl,
		stores,
	}: CreateTopStoresEntityInput) {
		await this.dynamodb.send(
			new PutItemCommand({
				TableName: this.tableName,
				Item: marshall({
					storeId: "TOP_STORES",
					imageUrl,
					stores,
				}),
			}),
		);

		return {
			imageUrl: `${process.env.STORE_MEDIA_STORAGE_CLOUDFRONT_URL}/${imageUrl}`,
			stores,
		};
	}

	public async getTopStores() {
		const result = await this.dynamodb.send(
			new GetItemCommand({
				TableName: this.tableName,
				Key: marshall({
					storeId: "TOP_STORES",
				}),
			}),
		);

		const { imageUrl, stores } = unmarshall(result.Item!) as TopStoresOutput;

		return {
			imageUrl: `${process.env.STORE_MEDIA_STORAGE_CLOUDFRONT_URL}/${imageUrl}`,
			stores,
		};
	}

	// Keys

	private indexStoreId({ storeId }: { storeId: StoreEntity["storeId"] }) {
		return {
			KeyConditionExpression: "#storeId = :storeId",
			ExpressionAttributeNames: {
				"#storeId": "storeId",
			},
			ExpressionAttributeValues: marshall({
				":storeId": `STORE#${storeId}`,
			}),
			Key: marshall({
				storeId: `STORE#${storeId}`,
			}),
		};
	}

	private indexName(entity: Pick<StoreEntity, "name">) {
		return {
			IndexName: "Name",
			KeyConditionExpression: "#name = :name",
			ExpressionAttributeNames: {
				"#name": "name",
			},
			ExpressionAttributeValues: marshall({
				":name": `NAME#${entity.name}`,
			}),
			Key: marshall({
				name: `NAME#${entity.name}`,
			}),
		};
	}

	private indexGender(entity: Pick<StoreEntity, "gender">) {
		return {
			IndexName: "GenderStoreId",
			KeyConditionExpression: "#gender = :gender",
			ExpressionAttributeNames: {
				"#gender": "gender",
			},
			ExpressionAttributeValues: marshall({
				":gender": `GENDER#${entity.gender}`,
			}),
		};
	}

	// Mappers

	protected entityToTable(entity: Partial<StoreEntity>): Partial<StoreTable> {
		return cleanObj<Partial<StoreTable>>({
			storeId: entity.storeId ? `STORE#${entity.storeId}` : undefined,
			accountId: entity.accountId ? `ACCOUNT#${entity.accountId}` : undefined,
			gender: entity.gender,
			productTypes: entity.productTypes,
			name: entity.name ? `NAME#${entity.name}` : undefined,
			description: entity.description,
			color: entity.color,
			bannerPath: entity.bannerUrl,
			avatarPath: entity.avatarUrl,
			createdAt: entity.createdAt?.toISOString(),
		});
	}

	protected tableToEntity(table: StoreTable): StoreEntity {
		return {
			storeId: table.storeId.replace("STORE#", ""),
			accountId: table.accountId.replace("ACCOUNT#", ""),
			productTypes: table.productTypes,
			gender: table.gender,
			name: table.name.replace("NAME#", ""),
			description: table.description,
			color: table.color,
			avatarUrl: table.avatarPath
				? `${process.env.STORE_MEDIA_STORAGE_CLOUDFRONT_URL}/${table.avatarPath}`
				: undefined,
			bannerUrl: table.bannerPath
				? `${process.env.STORE_MEDIA_STORAGE_CLOUDFRONT_URL}/${table.bannerPath}`
				: undefined,
			createdAt: new Date(table.createdAt),
		};
	}
}
