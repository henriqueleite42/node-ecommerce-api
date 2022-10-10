/* eslint-disable @typescript-eslint/no-magic-numbers */

import { customAlphabet } from "nanoid/non-secure";

const nanoid = customAlphabet(
	[
		"abcdefghijklmnopqrstuvwxyz",
		"ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		"0123456789",
		"!@#$%^&*()_+-=,./;<>?~",
	].join(""),
	64,
);

export const genRefreshToken = () => nanoid();
