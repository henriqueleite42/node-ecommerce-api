/* eslint-disable @typescript-eslint/naming-convention */

import { marshall } from "@aws-sdk/util-dynamodb";
import { cleanObj } from "@techmmunity/utils";

import type {
	BlacklistEntity,
	BlacklistRepository,
	CreateInput,
	GetInput,
} from "../../models/blacklist";

import { DynamodbRepository } from ".";

export interface BlacklistTable {
	accountId: string;
	storeCreation?: boolean;
	buying?: boolean;
}

export class BlacklistRepositoryDynamoDB
	extends DynamodbRepository<BlacklistTable, BlacklistEntity>
	implements BlacklistRepository
{
	protected readonly tableName = "blacklists";

	public async create({ accountId, ...data }: CreateInput) {
		const result = await this.update(
			this.indexAccountId({
				accountId,
			}).Key,
			data,
		);

		return result || { accountId };
	}

	public async get({ accountId }: GetInput) {
		const result = await this.getSingleItem(
			this.indexAccountId({
				accountId,
			}),
		);

		return result || { accountId };
	}

	// Keys

	private indexAccountId({ accountId }: Pick<BlacklistEntity, "accountId">) {
		return {
			KeyConditionExpression: "#accountId = :accountId",
			ExpressionAttributeNames: {
				"#accountId": "accountId",
			},
			ExpressionAttributeValues: marshall({
				":accountId": `ACCOUNT#${accountId}`,
			}),
			Key: marshall({
				accountId: `ACCOUNT#${accountId}`,
			}),
		};
	}

	// Mappers

	protected entityToTable(
		entity: Partial<BlacklistEntity>,
	): Partial<BlacklistTable> {
		return cleanObj({
			accountId: entity.accountId ? `ACCOUNT#${entity.accountId}` : undefined,
			storeCreation: entity.storeCreation,
			buying: entity.buying,
		});
	}

	protected tableToEntity(table: BlacklistTable): BlacklistEntity {
		return {
			accountId: table.accountId.replace("ACCOUNT#", ""),
			storeCreation: table.storeCreation,
			buying: table.buying,
		};
	}
}
