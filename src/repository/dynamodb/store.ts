/* eslint-disable @typescript-eslint/naming-convention */

import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { cleanObj } from "@techmmunity/utils";

import type {
	CreateInput,
	EditInput,
	GetByIdInput,
	GetByNameInput,
	GetManyByIdInput,
	StoreEntity,
	StoreRepository,
} from "../../models/store";

import { DynamodbRepository } from ".";

export interface StoreTable {
	storeId: string; // Same as AccountId
	accountId: string;
	name: string;
	description?: string;
	color?: string;
	bannerPath?: string;
	avatarPath?: string;
	createdAt: string;
}

export class StoreRepositoryDynamoDB
	extends DynamodbRepository<StoreTable, StoreEntity>
	implements StoreRepository
{
	protected readonly tableName = "stores";

	public async create({
		accountId,
		name,
		description,
		color,
		bannerUrl,
		avatarUrl,
	}: CreateInput) {
		const item: StoreEntity = {
			storeId: accountId,
			accountId,
			name,
			description,
			color,
			bannerUrl,
			avatarUrl,
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

	public edit({
		storeId,
		description,
		color,
		bannerUrl,
		avatarUrl,
	}: EditInput) {
		return this.update(
			this.indexStoreId({
				storeId,
			}).Key,
			{
				description,
				color,
				bannerUrl,
				avatarUrl,
			},
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

	// Mappers

	protected entityToTable(entity: Partial<StoreEntity>): Partial<StoreTable> {
		return cleanObj<Partial<StoreTable>>({
			storeId: entity.storeId ? `STORE#${entity.storeId}` : undefined,
			accountId: entity.accountId ? `ACCOUNT#${entity.accountId}` : undefined,
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
			name: table.name.replace("NAME#", ""),
			description: table.description,
			color: table.color,
			avatarUrl: table.avatarPath
				? `${process.env.IMAGES_PREFIX_URL}/${table.avatarPath}`
				: undefined,
			bannerUrl: table.bannerPath
				? `${process.env.IMAGES_PREFIX_URL}/${table.bannerPath}`
				: undefined,
			createdAt: new Date(table.createdAt),
		};
	}
}
