/* eslint-disable @typescript-eslint/naming-convention */

import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { cleanObj } from "@techmmunity/utils";

import type {
	AccessContentEntity,
	AccountAccessStoreEntity,
	AccountAccessesStoresRepository,
	CreateInput,
	GetListInput,
} from "../../models/access-content";

import { DynamodbRepository } from ".";

export interface AccountAccessStoreTable {
	accountId: string;
	storeId: string;
	storeName: string;
	createdAt: string;
	store: {
		color?: string;
		avatarUrl?: string;
	};

	storeName_storeId: string;
	createdAt_storeName_storeId: string;
}

export class AccountAccessStoreRepositoryDynamoDB
	extends DynamodbRepository<AccountAccessStoreTable, AccountAccessStoreEntity>
	implements AccountAccessesStoresRepository
{
	protected readonly tableName = "account_accesses_stores";

	public async create(p: CreateInput) {
		const item: AccountAccessStoreEntity = {
			...p,
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

	public getList({ limit, cursor, ...keys }: GetListInput) {
		return this.getMultipleItems(this.indexMain(keys), limit, cursor);
	}

	// Keys

	private indexMain(entity: Pick<AccessContentEntity, "accountId">) {
		const accountId = `ACCOUNT#${entity.accountId}`;

		return {
			KeyConditionExpression: "#accountId = :accountId",
			ExpressionAttributeNames: {
				"#accountId": "accountId",
			},
			ExpressionAttributeValues: marshall({
				":accountId": accountId,
			}),
		};
	}

	// Mappers

	// eslint-disable-next-line sonarjs/cognitive-complexity
	protected entityToTable(
		entity: Partial<AccountAccessStoreEntity>,
	): Partial<AccountAccessStoreTable> {
		const accountId = entity.accountId
			? `ACCOUNT#${entity.accountId}`
			: undefined;
		const storeId = entity.storeId ? `STORE#${entity.storeId}` : undefined;
		const storeName = entity.storeName;
		const createdAt = entity.createdAt?.toISOString();

		return cleanObj({
			accountId,
			storeId,
			storeName,
			createdAt,
			store: entity.store,

			storeName_storeId:
				storeName && storeId ? `${storeName}#${storeId}` : undefined,
			createdAt_storeName_storeId:
				createdAt && storeName && storeId
					? `${createdAt}#${storeName}#${storeId}`
					: undefined,
		});
	}

	protected tableToEntity(
		table: AccountAccessStoreTable,
	): AccountAccessStoreEntity {
		return {
			accountId: table.accountId.replace("ACCOUNT#", ""),
			storeId: table.storeId.replace("STORE#", ""),
			storeName: table.storeName,
			store: table.store,
			createdAt: new Date(table.createdAt),
		};
	}
}
