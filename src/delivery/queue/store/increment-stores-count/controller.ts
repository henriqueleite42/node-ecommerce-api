import { StoreService } from "factories/store";
import { makeController } from "helpers/make-controller";

export const controller = makeController(
	async () => {
		const service = new StoreService().getInstance();

		await service.increaseStoresCount();
	},
	{
		isPublic: true,
	},
);
