import { createFromThirdParty } from "./http/product/create-from-third-party/handler";
import { edit } from "./http/product/edit/handler";
import { getById } from "./http/product/get-by-id/handler";
import { getPaginated } from "./http/product/get-paginated/handler";
import { top } from "./http/product/top/handler";
import { incrementSalesCount } from "./queue/product/increment-sales-count/handler";
import { incrementTotalBilled } from "./queue/product/increment-total-billed/handler";
import { updateImg } from "./queue/product/update-img/handler";

export const productDomain = {
	productDomainCreateFromThirdParty: createFromThirdParty,
	productDomainEdit: edit,
	productDomainGetById: getById,
	productDomainGetPaginated: getPaginated,
	productDomainTop: top,
	productDomainUpdateImg: updateImg,
	productDomainIncrementSalesCount: incrementSalesCount,
	productDomainIncrementTotalBilled: incrementTotalBilled,
};
