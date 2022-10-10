/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/naming-convention */

import { DeleteItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { cleanObj } from "@techmmunity/utils";

import type {
	CreateRefreshTokenInput,
	GetByAccountIdRefreshTokenInput,
	GetByTokenRefreshTokenInput,
	RefreshTokenEntity,
	RefreshTokenRepository,
} from "../../models/refresh-token";

import { DynamodbRepository } from ".";

import { genRefreshToken } from "../../utils/id/gen-refresh-token";

/**
 * -------------------------------------------------
 *
 * Refresh Token is a sub-domain of the Account domain
 *
 * -------------------------------------------------
 */
interface RefreshTokenTable {
	accountId: string;
	token: string;
	createdAt: string;
}

export class RefreshTokenRepositoryDynamoDB
	extends DynamodbRepository<RefreshTokenTable, RefreshTokenEntity>
	implements RefreshTokenRepository
{
	protected readonly tableName = "refresh_tokens";

	public async create({ accountId }: CreateRefreshTokenInput) {
		const createdAt = new Date();

		const token = genRefreshToken();

		const item: RefreshTokenEntity = {
			accountId,
			token,
			createdAt,
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

	public getByToken(keys: GetByTokenRefreshTokenInput) {
		return this.getSingleItem(this.indexToken(keys));
	}

	public getByAccountId(keys: GetByAccountIdRefreshTokenInput) {
		return this.getSingleItem(this.indexAccountId(keys));
	}

	public async invalidate(keys: GetByAccountIdRefreshTokenInput) {
		await this.dynamodb.send(
			new DeleteItemCommand({
				TableName: this.tableName,
				Key: this.indexAccountId(keys).Key,
			}),
		);
	}

	// Keys

	private indexToken({ token }: Pick<RefreshTokenEntity, "token">) {
		return {
			KeyConditionExpression: "#token = :token",
			ExpressionAttributeNames: {
				"#token": "token",
			},
			ExpressionAttributeValues: marshall({
				":token": token,
			}),
			Key: marshall({
				token,
			}),
		};
	}

	private indexAccountId({ accountId }: Pick<RefreshTokenEntity, "accountId">) {
		return {
			Index: "AccountId",
			KeyConditionExpression: "#accountId = :accountId",
			ExpressionAttributeNames: {
				"#accountId": "accountId",
			},
			ExpressionAttributeValues: marshall({
				":accountId": accountId,
			}),
			Key: marshall({
				accountId,
			}),
		};
	}

	// Mappers

	protected entityToTable(
		entity: Partial<RefreshTokenEntity>,
	): Partial<RefreshTokenTable> {
		return cleanObj({
			accountId: entity.accountId ? `ACCOUNT#${entity.accountId}` : undefined,
			token: entity.token,
			createdAt: entity.createdAt?.toISOString(),
		});
	}

	protected tableToEntity(table: RefreshTokenTable): RefreshTokenEntity {
		return {
			accountId: table.accountId.replace("ACCOUNT#", ""),
			token: table.token,
			createdAt: new Date(table.createdAt),
		};
	}
}
