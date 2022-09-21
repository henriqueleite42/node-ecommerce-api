/**
 *			 		IN_CART -> PENDING -> PAID -> DELIVERED
 * CANCELED   <|-				 <|-				|				 |
 * 										REFUNDED     <|-			<|-
 */
export enum SalesStatusEnum {
	IN_CART = "IN_CART",
	PENDING = "PENDING",
	PAID = "PAID",
	DELIVERED = "DELIVERED",
	CANCELED = "CANCELED",
	REFUNDED = "REFUNDED",
}
