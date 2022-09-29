import { StoreService } from "../../../factories/store";
import type { GetByNameInput } from "../../../models/store";
import type { DeliveryManager } from "../../../providers/delivery-manager";
import { AuthManagerProvider } from "../../../providers/implementations/auth-manager";
import { Transform } from "../../../providers/implementations/transform";
import { Validations } from "../../../providers/implementations/validations";
import { ValidatorProvider } from "../../../providers/implementations/validator";

export const getByName = (server: DeliveryManager) => {
	server.addRoute<GetByNameInput>(
		{
			method: "GET",
			path: "stores",
		},
		route =>
			route
				.setAuth(new AuthManagerProvider(["DISCORD"]))
				.setValidator(
					new ValidatorProvider([
						{
							key: "name",
							loc: "query",
							validations: [Validations.required, Validations.username],
							transform: [Transform.lowercase],
						},
					]),
				)
				.setFunc(p => {
					const service = new StoreService().getInstance();

					return service.getByName(p);
				}),
	);
};
