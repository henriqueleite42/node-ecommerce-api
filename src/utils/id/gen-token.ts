import { uid } from "uid";

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
export const genToken = () => uid(32);
