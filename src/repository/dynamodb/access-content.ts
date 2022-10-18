/* eslint-disable @typescript-eslint/naming-convention */

import { BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { cleanObj } from "@techmmunity/utils";

import type {
	AccessContentEntity,
	GetAccessContentId,
	AccessContentRepository,
	CreateManyInput,
	GetFromProductInput,
} from "../../models/access-content";

import { DynamodbRepository } from ".";

import type { MediaTypeEnum } from "../../types/enums/media-type";

export interface AccessContentTable {
	accountId: string;
	storeId: string;
	productId: string;
	contentId: string;
	type: MediaTypeEnum;
	rawContentPath: string;
	processedContentPath: string;
	createdAt: string;

	pk: string;
	accountId_storeId: string;
	createdAt_productId_contentId: string;
	accountId_storeId_productId: string;
	createdAt_contentId: string;
	storeId_productId: string;
	createdAt_accountId_contentId: string;
}

export class AccessContentRepositoryDynamoDB
	extends DynamodbRepository<AccessContentTable, AccessContentEntity>
	implements AccessContentRepository
{
	protected readonly tableName = "accesses_contents";

	public async createMany(accesses: CreateManyInput) {
		const createdAt = new Date();

		const items: Array<AccessContentEntity> = accesses.map(access => ({
			...access,
			createdAt,
		}));

		const itemsTable = items.map(i => this.entityToTable(i));

		const result = await this.dynamodb.send(
			new BatchWriteItemCommand({
				RequestItems: {
					[this.tableName]: itemsTable.map(i => ({
						PutRequest: {
							Item: marshall(i),
						},
					})),
				},
			}),
		);

		if ((result.UnprocessedItems?.[this.tableName]?.length || 0) > 0) {
			await this.dynamodb.send(
				new BatchWriteItemCommand({
					RequestItems: {
						[this.tableName]: itemsTable.map(i => ({
							DeleteRequest: {
								Key: marshall({
									pk: i.pk,
								}),
							},
						})),
					},
				}),
			);

			throw new Error("Fail to create contents");
		}

		return items;
	}

	public get(keys: GetAccessContentId) {
		return this.getSingleItem(this.indexMain(keys));
	}

	public getFromProduct({ limit, cursor, ...keys }: GetFromProductInput) {
		return this.getMultipleItems(this.indexFromProduct(keys), limit, cursor);
	}

	// Keys

	private indexMain(
		entity: Pick<
			AccessContentEntity,
			"accountId" | "contentId" | "productId" | "storeId"
		>,
	) {
		const accountId = `ACCOUNT#${entity.accountId}`;
		const storeId = `STORE#${entity.storeId}`;
		const productId = `PRODUCT#${entity.productId}`;
		const contentId = `CONTENT#${entity.contentId}`;

		const pk = [accountId, storeId, productId, contentId].join("#");

		return {
			KeyConditionExpression: "#pk = :pk",
			ExpressionAttributeNames: {
				"#pk": "pk",
			},
			ExpressionAttributeValues: marshall({
				":pk": pk,
			}),
			Key: marshall({
				pk,
			}),
		};
	}

	private indexFromProduct(
		entity: Pick<AccessContentEntity, "accountId" | "productId" | "storeId">,
	) {
		const accountId = `ACCOUNT#${entity.accountId}`;
		const storeId = `STORE#${entity.storeId}`;
		const productId = `PRODUCT#${entity.productId}`;

		const value = [accountId, storeId, productId].join("#");

		return {
			Index: "AccountIdStoreIdCreatedAtProductIdContentId",
			KeyConditionExpression:
				"#accountId_storeId_productId = :accountId_storeId_productId",
			ExpressionAttributeNames: {
				"#accountId_storeId_productId": "accountId_storeId_productId",
			},
			ExpressionAttributeValues: marshall({
				":accountId_storeId_productId": value,
			}),
			Key: marshall({
				pk: value,
			}),
		};
	}

	// Mappers

	// eslint-disable-next-line sonarjs/cognitive-complexity
	protected entityToTable(
		entity: Partial<AccessContentEntity>,
	): Partial<AccessContentTable> {
		const accountId = entity.accountId
			? `ACCOUNT#${entity.accountId}`
			: undefined;
		const storeId = entity.storeId ? `STORE#${entity.storeId}` : undefined;
		const productId = entity.productId
			? `PRODUCT#${entity.productId}`
			: undefined;
		const contentId = entity.contentId
			? `CONTENT#${entity.contentId}`
			: undefined;
		const createdAt = entity.createdAt?.toISOString();

		const pk =
			[accountId, storeId, productId, contentId].filter(Boolean).join("#") ||
			undefined;

		return cleanObj({
			accountId,
			storeId,
			productId,
			createdAt,

			pk,
			accountId_storeId:
				accountId && storeId ? [accountId, storeId].join("#") : undefined,
			createdAt_productId_contentId:
				createdAt && productId && contentId
					? [createdAt, productId, contentId].join("#")
					: undefined,
			accountId_storeId_productId:
				accountId && storeId && productId
					? [accountId, storeId, productId].join("#")
					: undefined,
			createdAt_contentId:
				createdAt && contentId ? [createdAt, contentId].join("#") : undefined,
			storeId_productId:
				storeId && productId ? [storeId, productId].join("#") : undefined,
			createdAt_accountId_contentId:
				createdAt && accountId && contentId
					? [createdAt, accountId, contentId].join("#")
					: undefined,
		});
	}

	protected tableToEntity(table: AccessContentTable): AccessContentEntity {
		return {
			accountId: table.accountId.replace("ACCOUNT#", ""),
			storeId: table.storeId.replace("STORE#", ""),
			productId: table.productId.replace("PRODUCT#", ""),
			contentId: table.contentId?.replace("CONTENT#", ""),
			type: table.type,
			rawContentPath: table.rawContentPath,
			processedContentPath: table.processedContentPath,
			createdAt: new Date(table.createdAt),
		};
	}
}
