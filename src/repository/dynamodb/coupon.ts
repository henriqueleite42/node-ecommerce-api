/* eslint-disable @typescript-eslint/naming-convention */

import { marshall } from "@aws-sdk/util-dynamodb";
import { cleanObj } from "@techmmunity/utils";

import type {
	CouponEntity,
	CouponRepository,
	GetInput,
} from "../../models/coupon";

import { DynamodbRepository } from ".";

import type { DiscountTypeEnum } from "../../types/enums/discount-type";

export interface CouponTable {
	code: string;
	storeId: string;
	discountType: DiscountTypeEnum;
	amount: number;
	usesCount: number;
	createdAt: string;
	validations?: CouponEntity["validations"];
}

export class CouponRepositoryDynamoDB
	extends DynamodbRepository<CouponTable, CouponEntity>
	implements CouponRepository
{
	protected readonly tableName = "coupons";

	public get(keys: GetInput) {
		return this.getSingleItem(this.indexStoreIdCode(keys));
	}

	// Keys

	private indexStoreIdCode({
		storeId,
		code,
	}: Pick<CouponEntity, "code" | "storeId">) {
		return {
			KeyConditionExpression: "#storeId = :storeId AND #code = :code",
			ExpressionAttributeNames: {
				"#storeId": "storeId",
				"#code": "code",
			},
			ExpressionAttributeValues: marshall({
				":storeId": `STORE#${storeId}`,
				":code": code,
			}),
			Key: marshall({
				storeId: `STORE#${storeId}`,
				code,
			}),
		};
	}

	// Mappers

	protected entityToTable(entity: Partial<CouponEntity>): Partial<CouponTable> {
		return cleanObj({
			code: entity.code,
			storeId: entity.storeId ? `STORE#${entity.storeId}` : undefined,
			discountType: entity.discountType,
			amount: entity.amount,
			usesCount: entity.usesCount,
			createdAt: entity.createdAt?.toISOString(),
			validations: entity.validations,
		});
	}

	protected tableToEntity(table: CouponTable): CouponEntity {
		return {
			code: table.code,
			storeId: table.storeId.replace("STORE#", ""),
			discountType: table.discountType,
			amount: table.amount,
			usesCount: table.usesCount,
			createdAt: new Date(table.createdAt),
			validations: table.validations,
		};
	}
}
