/* eslint-disable @typescript-eslint/naming-convention */

import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { cleanObj } from "@techmmunity/utils";

import type {
	CreateInput,
	EditInput,
	GetAllFromAccountInput,
	GetByIdInput,
	GetByNameInput,
	GetManyByIdInput,
	StoreEntity,
} from "../../models/store";

import { DynamodbRepository } from ".";

export interface StoreTable {
	storeId: string;
	accountId: string;
	name: string;
	description?: string;
	color?: string;
	bannerUrl?: string;
	avatarUrl?: string;
	createdAt: string;

	accountId_storeId: string;
}

export class StoreRepositoryDynamoDB
	extends DynamodbRepository<StoreTable, StoreEntity>
	implements StoreRepositoryDynamoDB
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
		accountId,
		storeId,
		description,
		color,
		bannerUrl,
		avatarUrl,
	}: EditInput) {
		return this.update(
			this.indexAccountIdStoreId({
				accountId,
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

	public getAllFromAccount({
		limit,
		continueFrom,
		...keys
	}: GetAllFromAccountInput) {
		return this.getMultipleItems(
			this.indexAccountIdStoreId(keys),
			limit,
			continueFrom,
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

	private indexAccountIdStoreId({
		accountId,
		storeId,
	}: {
		accountId: StoreEntity["accountId"];
		storeId?: StoreEntity["storeId"];
	}) {
		return {
			IndexName: "AccountIdStoreId",
			KeyConditionExpression: [
				"#accountId = :accountId",
				storeId ? "#storeId = :storeId" : undefined,
			]
				.filter(Boolean)
				.join(", "),
			ExpressionAttributeNames: {
				"#accountId": "accountId",
				...(storeId
					? {
							"#storeId": "storeId",
					  }
					: {}),
			},
			ExpressionAttributeValues: marshall({
				":accountId": `ACCOUNT#${accountId}`,
				...(storeId
					? {
							":storeId": `STORE#${storeId}`,
					  }
					: {}),
			}),
			Key: marshall(
				cleanObj({
					accountId: `ACCOUNT#${accountId}`,
					storeId: storeId ? `STORE#${storeId}` : undefined,
				}),
			),
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

	protected entityToTable(entity: StoreEntity): StoreTable {
		const storeId = `STORE#${entity.storeId}`;
		const accountId = `ACCOUNT#${entity.accountId}`;

		return cleanObj({
			storeId,
			accountId,
			name: `NAME#${entity.name}`,
			description: entity.description,
			color: entity.color,
			bannerUrl: entity.bannerUrl,
			avatarUrl: entity.avatarUrl,
			createdAt: entity.createdAt.toISOString(),

			accountId_storeId: `${accountId}#${storeId}`,
		});
	}

	protected tableToEntity(table: StoreTable): StoreEntity {
		return {
			storeId: table.storeId.replace("STORE#", ""),
			accountId: table.accountId.replace("ACCOUNT#", ""),
			name: table.name.replace("NAME#", ""),
			description: table.description,
			color: table.color,
			bannerUrl: table.bannerUrl,
			avatarUrl: table.avatarUrl,
			createdAt: new Date(table.createdAt),
		};
	}
}
