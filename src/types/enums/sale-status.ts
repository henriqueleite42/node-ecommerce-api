/**
 * https://miro.com/app/board/uXjVPYY_sok=/
 */
export enum SalesStatusEnum {
	IN_CART = "IN_CART",
	PENDING = "PENDING",
	PAID = "PAID",
	DELIVERED = "DELIVERED",

	// Ended in a happy way
	DELIVERY_CONFIRMED = "DELIVERY_CONFIRMED",

	// Ended in a sad way
	CANCELED = "CANCELED",
	REFUNDED = "REFUNDED",
	EXPIRED = "EXPIRED",

	// A problem occurred and we are trying to solve
	IN_DISPUTE = "IN_DISPUTE",
}
