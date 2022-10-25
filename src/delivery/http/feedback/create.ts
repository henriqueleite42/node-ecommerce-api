import { FeedbackService } from "../../../factories/feedback";
import type { CreateFeedbackInput } from "../../../models/feedback";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const create = (serverInstance: HttpManager) => {
	serverInstance.addRoute<CreateFeedbackInput>(
		{
			method: "POST",
			path: "feedbacks",
			auth: ["DISCORD_USER", "REST_USER"],
			validations: [
				{
					key: "accountId",
					loc: "auth",
					validations: [Validations.required, Validations.id],
				},
				{
					key: "saleId",
					loc: "body",
					validations: [Validations.required, Validations.id],
				},
				{
					key: "feedback",
					loc: "body",
					validations: [Validations.required, Validations.feedback],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new FeedbackService().getInstance();

				return service.create(p);
			}),
	);
};
