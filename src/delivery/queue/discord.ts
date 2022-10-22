import { newProductAnnouncement } from "./discord/new-product-announcement";
import { newSaleAnnouncement } from "./discord/new-sale-announcement";
import { newStoreAnnouncement } from "./discord/new-store-announcement";
import { notifyBuyerAccessGrantedMessage } from "./discord/notify-buyer-access-granted";
import { notifyBuyerSaleDelivered } from "./discord/notify-buyer-sale-delivered";
import { notifyBuyerSaleDeliveryConfirmed } from "./discord/notify-buyer-sale-delivery-confirmed";
import { notifyBuyerSalePaid } from "./discord/notify-buyer-sale-paid";
import { notifySellerCustomAutomaticProductsSale } from "./discord/notify-seller-custom-automatic-products-sale";
import { notifySellerCustomManualProductsSale } from "./discord/notify-seller-custom-manual-products-sale";
import { notifySellerLiveManualProductsSale } from "./discord/notify-seller-live-manual-products-sale";
import { notifySellerPreMadeManualProductsSale } from "./discord/notify-seller-pre-made-manual-products-sale";
import { notifySellerSaleDeliveryConfirmed } from "./discord/notify-seller-sale-delivery-confirmed";

export const discord = {
	discordNewSaleAnnouncement: newSaleAnnouncement,
	discordNewStoreAnnouncement: newStoreAnnouncement,
	discordNewProductAnnouncement: newProductAnnouncement,
	discordNotifyBuyerAccessGrantedMessage: notifyBuyerAccessGrantedMessage,
	discordNotifyBuyerSaleDelivered: notifyBuyerSaleDelivered,
	discordNotifyBuyerSaleDeliveryConfirmed: notifyBuyerSaleDeliveryConfirmed,
	discordNotifyBuyerSalePaid: notifyBuyerSalePaid,
	discordNotifSellerCustomAutomaticSale:
		notifySellerCustomAutomaticProductsSale,
	discordNotifSellerCustomManualSale: notifySellerCustomManualProductsSale,
	discordNotifSellerLiveManualSale: notifySellerLiveManualProductsSale,
	discordNotifSellerPreMadeManualSale: notifySellerPreMadeManualProductsSale,
	discordNotifySellerSaleDeliveryConfirmed: notifySellerSaleDeliveryConfirmed,
};
