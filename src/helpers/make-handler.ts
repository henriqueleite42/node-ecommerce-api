import type { Lambda } from "types/aws";

export const makeHandler = (handler: Lambda): Lambda => ({
	...handler, // Must come in the end, so we can overwrite params
});
