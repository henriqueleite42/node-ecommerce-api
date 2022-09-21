export enum DeliveryMethodEnum {
	AUTOMATIC_DISCORD_DM = "AUTOMATIC_DISCORD_DM",
	MANUAL_GOOGLE_DRIVE_ACCESS = "MANUAL_GOOGLE_DRIVE_ACCESS",
}

export const isAutomaticDelivery = (deliveryMethod: DeliveryMethodEnum) =>
	deliveryMethod.startsWith("AUTOMATIC_");

export const isManualDelivery = (deliveryMethod: DeliveryMethodEnum) =>
	deliveryMethod.startsWith("MANUAL_");
