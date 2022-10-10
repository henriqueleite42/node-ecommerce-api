/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/naming-convention */

import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { cleanObj } from "@techmmunity/utils";

import type {
	CreateMagicLinkInput,
	GetMagicLinkInput,
	MagicLinkEntity,
	MagicLinkRepository,
} from "../../models/magic-link";

import { DynamodbRepository } from ".";

import { genToken } from "../../utils/id/gen-token";

/**
 * -------------------------------------------------
 *
 * Magic Link is a sub-domain of the Account domain
 *
 * -------------------------------------------------
 */
interface MagicLinkTable {
	accountId: string;
	token: string;
	createdAt: string;
	expiresAt: string;
	ttl: number;
}

const FIVE_MINUTES = 5 * 60 * 1000;

export class MagicLinkRepositoryDynamoDB
	extends DynamodbRepository<MagicLinkTable, MagicLinkEntity>
	implements MagicLinkRepository
{
	protected readonly tableName = "magic_links";

	public async create({ accountId }: CreateMagicLinkInput) {
		const createdAt = new Date();
		const expiresAt = new Date(createdAt.getTime() + FIVE_MINUTES);

		const token = genToken();

		const item: MagicLinkEntity = {
			accountId,
			token,
			createdAt,
			expiresAt,
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

	public get(keys: GetMagicLinkInput) {
		return this.getSingleItem(this.indexToken(keys));
	}

	// Keys

	private indexToken({ token }: Pick<MagicLinkEntity, "token">) {
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

	// Mappers

	protected entityToTable(
		entity: Partial<MagicLinkEntity>,
	): Partial<MagicLinkTable> {
		return cleanObj({
			accountId: entity.accountId ? `ACCOUNT#${entity.accountId}` : undefined,
			token: entity.token,
			createdAt: entity.createdAt?.toISOString(),
			expiresAt: entity.expiresAt?.toISOString(),
			ttl: entity.expiresAt
				? parseInt((entity.expiresAt.getTime() / 1000).toString(), 10)
				: undefined,
		});
	}

	protected tableToEntity(table: MagicLinkTable): MagicLinkEntity {
		return {
			accountId: table.accountId.replace("ACCOUNT#", ""),
			token: table.token,
			createdAt: new Date(table.createdAt),
			expiresAt: new Date(table.expiresAt),
		};
	}
}
