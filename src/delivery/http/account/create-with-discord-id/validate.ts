/* eslint-disable @typescript-eslint/no-magic-numbers */

import type { CreateWithDiscordIdInput } from "models/account";
import { makeValidate } from "utils/validate";
import { yup } from "utils/yup";

const schema = yup
	.object()
	.strict()
	.shape({
		discordId: yup
			.string()
			.strict()
			.required()
			.matches(/^\d{18}$/),
	});

export const validate = makeValidate<CreateWithDiscordIdInput>(schema);
