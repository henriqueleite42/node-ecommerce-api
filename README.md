# Maite API

## How the things work?

- The project is divided in many _domains_ (like Account, Sale, Content), and _modules_, that are groups of one or more _domains_.

## How to run the project locally?

- Install `serverless` as a global dependency:

```
yarn global add serverless
```

- In one window of the terminal, run `yarn docker:server`
- Wait for it to run
- Open a new terminal window
- Run THIS:

```
API_MODULE=<module> yarn deploy:<env>
```

- You can see all the available modules at the end of the file `serverless.ts`, there will be a function `getConfig` with a `switch` statement on it. You can use all the values on the `case`s as a `module` value.
- Envs allowed:
  - **local**: The LOCAL environment, to develop and test new features
  - **dev**: The HOMOLOGATION environment, a cloud environment to test it before it goes to production
  - **production**: Production

# Env

## Secrets

### auth

```json
monetizzer-auth
{
	"PASETO_PRIVATE_KEY": "",
	"API_BOT_TOKEN": ""
}
```

### discord

```json
monetizzer-discord
{
	"DISCORD_BOT_TOKEN": "",
	"DISCORD_BOT_CLIENT_ID": "",
	"DISCORD_BOT_CLIENT_SECRET": "",
	"DISCORD_REDIRECT_URI": ""
}
```

### sale

```json
monetizzer-gerencianet-certs-cert
{
	"GERENCIANET_CERTIFICATE_CERT": ""
}
```

```json
monetizzer-gerencianet-certs-key
{
	"GERENCIANET_CERTIFICATE_KEY": ""
}
```

```json
monetizzer-gerencianet
{
	"GERENCIANET_URL": "",
	"GERENCIANET_CLIENT_ID": "",
	"GERENCIANET_CLIENT_SECRET": "",
	"GERENCIANET_PIX_KEY": ""
}
```

## Resources

### product

```json
{
	"DELAY_PRODUCT_CREATION_NOTIFICATION_QUEUE_URL": "",
	"PRODUCT_CREATED_TOPIC_ARN": "",
	"PRODUCT_DELETED_TOPIC_ARN": "",
	"MEDIA_BUCKET_NAME": "",
	"MEDIA_STORAGE_CLOUDFRONT_URL": ""
}
```

### store

```json
{
	"STORE_CREATED_TOPIC_ARN": "",
	"MEDIA_BUCKET_NAME": "",
	"MEDIA_STORAGE_CLOUDFRONT_URL": ""
}
```

### content

```json
{
	"MEDIA_BUCKET_NAME": "",
	"CONTENT_CREATED_TOPIC_ARN": "",
	"ACCESS_GRANTED_TOPIC_ARN": "",
	"GIVE_BUYER_ACCESS_TO_PRE_MADE_AUTOMATIC_SALE_PRODUCTS_QUEUE_URL": ""
}
```

### discord

```json
{
	"NEW_SALE_ANNOUNCEMENT_QUEUE_URL": "",
	"NEW_STORE_ANNOUNCEMENT_QUEUE_URL": "",
	"NEW_PRODUCT_ANNOUNCEMENT_QUEUE_URL": "",
	"NOTIFY_SELLER_CUSTOM_AUTOMATIC_PRODUCTS_SALE_QUEUE_URL": "",
	"NOTIFY_SELLER_PRE_MADE_MANUAL_PRODUCTS_SALE_QUEUE_URL": "",
	"NOTIFY_SELLER_LIVE_MANUAL_PRODUCTS_SALE_QUEUE_URL": "",
	"NOTIFY_SELLER_SALE_DELIVERY_CONFIRMED_QUEUE_URL": ""
}
```

### sale

```json
{
	"SALE_PAID_TOPIC_ARN": "",
	"SALE_DELIVERED_TOPIC_ARN": "",
	"SALE_DELIVERY_CONFIRMED_TOPIC_ARN": "",
	"SALES_EXPIRED_TOPIC_ARN": ""
}
```
