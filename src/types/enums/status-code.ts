/* eslint-disable @typescript-eslint/no-magic-numbers */

/**
 * You need to create a migration to update the enum on the database too!
 */
export enum StatusCodeEnum {
	SUCCESS = 200,
	CREATED = 201,
	NO_CONTENT = 204,
	REDIRECT = 301,
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	FORBIDDEN = 403,
	NOT_FOUND = 404,
	CONFLICT = 409,
	INTERNAL = 500,
	BAD_GATEWAY = 502,
}
