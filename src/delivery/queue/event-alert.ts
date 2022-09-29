import { newProductEvent } from "./event-alert/new-product-event";
import { newSaleEvent } from "./event-alert/new-sale-event";
import { newStoreEvent } from "./event-alert/new-store-event";

export const eventAlert = {
	eventAlertNewProductEvent: newProductEvent,
	eventAlertNewSaleEvent: newSaleEvent,
	eventAlertNewStoreEvent: newStoreEvent,
};
