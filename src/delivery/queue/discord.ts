import { newProductAnnouncement } from "./discord/new-product-announcement";
import { newSaleAnnouncement } from "./discord/new-sale-announcement";
import { newStoreAnnouncement } from "./discord/new-store-announcement";
import { notifyBuyerSalePaid } from "./discord/notify-buyer-sale-paid";
import { notifySellerCustomProductsSale } from "./discord/notify-seller-order-custom-product";
import { notifySellerLiveProductsSale } from "./discord/notify-seller-order-live-product";

export const discord = {
	discordNewSaleAnnouncement: newSaleAnnouncement,
	discordNewStoreAnnouncement: newStoreAnnouncement,
	discordNewProductAnnouncement: newProductAnnouncement,
	discordNotifyBuyerSalePaid: notifyBuyerSalePaid,
	discordNotifySellerCustomProductsSale: notifySellerCustomProductsSale,
	discordNotifySellerLiveProductsSale: notifySellerLiveProductsSale,
};
