import type {
	AccessId,
	AccessRepository,
	AccessUseCase,
} from "../models/access";
import type { SalePaidMessage } from "../models/sale";

import { CustomError } from "../utils/error";

import { isPreMadeProduct } from "../types/enums/product-type";
import { StatusCodeEnum } from "../types/enums/status-code";

export class AccessUseCaseImplementation implements AccessUseCase {
	public constructor(private readonly accessRepository: AccessRepository) {}

	public async giveAccessAfterSale({
		clientId,
		storeId,
		products,
	}: SalePaidMessage) {
		const preMadeProducts = products.filter(p => isPreMadeProduct(p.type));

		if (preMadeProducts.length === 0) return;

		await this.accessRepository.createMany({
			accountId: clientId,
			accesses: preMadeProducts.map(p => ({
				storeId,
				productId: p.productId,
				variationId: p.variationId,
			})),
		});
	}

	public async get(p: AccessId) {
		const access = await this.accessRepository.get(p);

		if (!access) {
			throw new CustomError(
				"User doesn't have access to this content",
				StatusCodeEnum.UNAUTHORIZED,
			);
		}

		return access;
	}
}
