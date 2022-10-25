import { FeedbackService } from "../../../factories/feedback";
import type { ChangeVisibilityInput } from "../../../models/feedback";
import type { HttpManager } from "../../../providers/http-manager";
import { Validations } from "../../../providers/implementations/validations";

export const changeVisibility = (serverInstance: HttpManager) => {
	serverInstance.addRoute<ChangeVisibilityInput>(
		{
			method: "PATCH",
			path: "feedbacks/visibility",
			auth: ["DISCORD_USER", "REST_USER"],
			validations: [
				{
					key: "accountId",
					loc: "auth",
					validations: [Validations.required, Validations.id],
				},
				{
					key: "feedbackId",
					loc: "body",
					validations: [Validations.required, Validations.id],
				},
				{
					key: "display",
					loc: "body",
					validations: [Validations.required, Validations.boolean],
				},
			],
		},
		route =>
			route.setFunc(p => {
				const service = new FeedbackService().getInstance();

				return service.changeVisibility(p);
			}),
	);
};
