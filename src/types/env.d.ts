/* eslint-disable @typescript-eslint/naming-convention */

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: "dev" | "homolog" | "local" | "production" | "test";
			/**
			 * Localstack
			 */
			LOCALSTACK_HOSTNAME?: string;
			/**
			 * AWS
			 */
			CLOUD_REGION: string;
			STACK_NAME: string;
			AWS_REGION: string;
			AWS_LAMBDA_FUNCTION_NAME: string;
			AWS_ACCESS_KEY_ID: string;
			AWS_SECRET_ACCESS_KEY: string;
			/**
			 * Gerencianet
			 */
			GERENCIANET_CERTIFICATE_CERT: string;
			GERENCIANET_CERTIFICATE_KEY: string;
			GERENCIANET_URL: string;
			GERENCIANET_CLIENT_ID: string;
			GERENCIANET_CLIENT_SECRET: string;
			GERENCIANET_PIX_KEY: string;
			/**
			 * Authorization
			 */
			API_BOT_TOKEN: string; // The token that WE generate to let the bot use the API
		}
	}
}

/*
 * If this file has no import/export statements (i.e. is a script)
 * convert it into a module by adding an empty export statement.
 */
export {};
