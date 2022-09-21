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
			 * Aurora
			 */
			PGHOST: string;
			PGUSER: string;
			PGDATABASE: string;
			PGPASSWORD: string;
			PGPORT: string;
			/**
			 * Ses
			 */
			SOURCE_EMAIL_TO_SEND_EMAILS: string;
			/**
			 * Sqs
			 */
			DOWNLOAD_IMG_FROM_URL_QUEUE_URL: string;
			DOWNLOAD_VIDEO_FROM_URL_QUEUE_URL: string;
			SEND_MAGIC_LINK_QUEUE_URL: string;
			SEND_CONFIRMATION_CODE_QUEUE_URL: string;
			SEND_VERIFICATION_MSG_QUEUE_URL: string;
			SEND_DELETE_CODE_QUEUE_URL: string;
			RUN_SQL_FILES_FROM_S3_QUEUE_URL: string;
			DOWNLOAD_FROM_URL_QUEUE_URL: string;
			UNSUBSCRIBE_TO_TWITCH_EVENTS_QUEUE_URL: string;
			/**
			 * Sns
			 */
			USER_VERIFIED_TOPIC_ARN: string;
			USER_CREATED_TOPIC_ARN: string;
			CONTACT_ADDED_TOPIC_ARN: string;
			USER_USERNAME_MODIFIED_TOPIC_ARN: string;
			USER_PASSWORD_MODIFIED_TOPIC_ARN: string;
			UPDATE_ASSETS_TOPIC_ARN: string;
			VOD_SNS_TOPIC_ARN: string;
			TWITCH_WEBHOOK_TOPIC_ARN: string;
			/**
			 * S3
			 */
			RAW_UPLOAD_BUCKET_NAME: string;
			PROCESSED_UPLOAD_BUCKET_NAME: string;
			VOD_SOURCE: string;
			VOD_DESTINATION: string;
			/**
			 * VOD
			 */
			VOD_SOLUTION_IDENTIFIER: string;
			VOD_INGEST_WORKFLOW: string;
			VOD_PROCESS_WORKFLOW: string;
			VOD_PUBLISH_WORKFLOW: string;
			/**
			 * DYNAMO
			 */
			VOD_DYNAMO_DB_TABLE: string;
			/**
			 * MEDIA CONVERT
			 */
			VOD_MEDIA_CONVERT_ROLE: string;
			/**
			 * CLOUD FRONT
			 */
			VOD_CLOUD_FRONT: string;
			/**
			 * Lambda
			 */
			ERROR_HANDLER_LAMBDA: string;
			/**
			 * JWT
			 */
			JWT_SECRET: string;
			/**
			 * Discord
			 */
			DISCORD_CLIENT_ID: string;
			DISCORD_CLIENT_SECRET: string;
			DISCORD_REDIRECT_URL: string;
			DISCORD_BOT_TOKEN: string;
			/**
			 * Apple
			 */
			APPLE_CLIENT_ID: string;
			APPLE_CLIENT_SECRET: string;
			APPLE_REDIRECT_URL: string;
			/**
			 * Google
			 */
			GOOGLE_CLIENT_ID: string;
			GOOGLE_CLIENT_SECRET: string;
			GOOGLE_REDIRECT_URL: string;
			/**
			 * Twitch
			 */
			TWITCH_CLIENT_ID: string;
			TWITCH_CLIENT_SECRET: string;
			TWITCH_REDIRECT_URL: string;
			TWITCH_APP_ACCESS_TOKEN: string;
			TWITCH_EVENT_HANDLER_URL: string;
			TWITCH_WEBHOOK_SECRET: string;
			/**
			 * Microsoft
			 */
			MICROSOFT_CLIENT_ID: string;
			MICROSOFT_CLIENT_SECRET: string;
			MICROSOFT_REDIRECT_URL: string;
			/**
			 * SPOTIFY
			 */
			SPOTIFY_CLIENT_ID: string;
			SPOTIFY_CLIENT_SECRET: string;
			SPOTIFY_REDIRECT_URL: string;
			/**
			 * Firebase
			 */
			FIREBASE_API_KEY: string;
			CLOUD_MESSAGING_API_KEY: string;
			/**
			 * Captis domain
			 */
			CAPTIS_AUTH_BASE_URL: string;
			MAGIC_URL_PREFIX: string;
			/**
			 * Android settings
			 */
			ANDROID_BUNDLE_ID: string;
			/**
			 * IOS settings
			 */
			IOS_BUNDLE_ID: string;

			/**
			 * Assets
			 */
			IMAGE_DOMAIN_URL: string;
			VIDEO_DOMAIN_URL: string;
			RAW_VIDEO_DOMAIN_URL: string;
		}
	}
}

/*
 * If this file has no import/export statements (i.e. is a script)
 * convert it into a module by adding an empty export statement.
 */
export {};
