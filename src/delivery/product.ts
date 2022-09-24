import { create } from "./http/product/create";
import { edit } from "./http/product/edit";
import { getById } from "./http/product/get-by-id";
import { getPaginated } from "./http/product/get-paginated";
import { top } from "./http/product/top";
import { incrementSalesCount } from "./queue/product/increment-sales-count";
import { incrementTotalBilled } from "./queue/product/increment-total-billed";
import { updateImg } from "./queue/product/update-img";

export const product = {
	productCreate: create,
	productEdit: edit,
	productGetById: getById,
	productGetPaginated: getPaginated,
	productTop: top,
	productUpdateImg: updateImg,
	productIncrementSalesCount: incrementSalesCount,
	productIncrementTotalBilled: incrementTotalBilled,
};
