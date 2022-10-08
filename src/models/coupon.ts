import type { DiscountTypeEnum } from "../types/enums/discount-type";
import type { ProductTypeEnum } from "../types/enums/product-type";

interface CouponValidation {
	clientsIds?: Array<string>;
	productsIds?: Array<string>;
	productsTypes?: Array<ProductTypeEnum>;
	usesLimit?: number;
	onlyOnUserFirstGlobalPurchase?: boolean;
	onlyOnUserFirstStorePurchase?: boolean;
	onlyOnePerUser?: boolean;
	validAfter?: Date;
	expiresAt?: Date;
}

export interface CouponEntity {
	code: string; // /^A-Z0-9*$/
	storeId: string; // "ALL" / {storeId}
	discountType: DiscountTypeEnum;
	amount: number;
	usesCount: number;
	createdAt: Date;
	validations?: CouponValidation;
}

/**
 *
 *
 * Repository
 *
 *
 */

export interface GetInput {
	code: string;
	storeId: string;
}

export interface CouponRepository {
	get: (p: GetInput) => Promise<CouponEntity | null>;
}
