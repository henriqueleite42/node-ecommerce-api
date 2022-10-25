import { FeedbackService } from "../../../factories/feedback";
import type { GetManyInput } from "../../../models/feedback";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const getMany = (serverInstance: HttpManager) => {
	serverInstance.addRoute<GetManyInput>(
		{
			method: "GET",
			path: "feedbacks",
			auth: ["DISCORD_BOT", "REST"],
			validations: [
				{
					key: "storeId",
					loc: "query",
					validations: [Validations.required, Validations.id],
				},
				{
					key: "limit",
					loc: "query",
					validations: [Validations.required, Validations.limit],
				},
				{
					key: "cursor",
					loc: "query",
					validations: [Validations.required, Validations.cursor],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new FeedbackService().getInstance();

				return service.getMany(p);
			}),
	);
};
