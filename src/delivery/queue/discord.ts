import { newProductAnnouncement } from "./discord/new-product-announcement";
import { newSaleAnnouncement } from "./discord/new-sale-announcement";
import { newStoreAnnouncement } from "./discord/new-store-announcement";
import { notifyBuyerAccessGrantedMessage } from "./discord/notify-buyer-access-granted";
import { notifyBuyerSaleDelivered } from "./discord/notify-buyer-sale-delivered";
import { notifyBuyerSaleDeliveryConfirmed } from "./discord/notify-buyer-sale-delivery-confirmed";
import { notifyBuyerSalePaid } from "./discord/notify-buyer-sale-paid";
import { notifySellerCustomProductsSale } from "./discord/notify-seller-order-custom-product";
import { notifySellerLiveProductsSale } from "./discord/notify-seller-order-live-product";
import { notifySellerSaleDeliveryConfirmed } from "./discord/notify-seller-sale-delivery-confirmed";

export const discord = {
	discordNewSaleAnnouncement: newSaleAnnouncement,
	discordNewStoreAnnouncement: newStoreAnnouncement,
	discordNewProductAnnouncement: newProductAnnouncement,
	discordNotifyBuyerAccessGrantedMessage: notifyBuyerAccessGrantedMessage,
	discordNotifyBuyerSaleDelivered: notifyBuyerSaleDelivered,
	discordNotifyBuyerSaleDeliveryConfirmed: notifyBuyerSaleDeliveryConfirmed,
	discordNotifyBuyerSalePaid: notifyBuyerSalePaid,
	discordNotifySellerCustomProductsSale: notifySellerCustomProductsSale,
	discordNotifySellerLiveProductsSale: notifySellerLiveProductsSale,
	discordNotifySellerSaleDeliveryConfirmed: notifySellerSaleDeliveryConfirmed,
};
