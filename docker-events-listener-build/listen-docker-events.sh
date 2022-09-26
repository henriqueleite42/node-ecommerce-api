#!/bin/bash

# You need to change this if you changed the one at serverless.ts
SERVICE_NAME=monetizzer

docker events --filter 'event=create'  --filter 'event=start' --filter 'type=container' --format '{{.Actor.Attributes.name}} {{.Status}}' | while read event_info

do
	event_infos=($event_info)
	container_name=${event_infos[0]}
	event=${event_infos[1]}

	echo "$container_name: status = ${event}"

	if [[ $container_name = "maite-api_localstack" ]] && [[ $event == "start" ]]; then
		echo "Sleeping"

		sleep 5 # let localstack some time to start

		echo "Creating Secrets"

		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-gerencianetCertificateCert" --type String --value "$GERENCIANET_URL" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-gerencianetCertificateKey" --type String --value "$GERENCIANET_CLIENT_ID" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-gerencianetUrl" --type String --value "$GERENCIANET_CLIENT_SECRET" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-gerencianetClientId" --type String --value "$GERENCIANET_CERTIFICATE_CERT" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-gerencianetClientSecret" --type String --value "$GERENCIANET_CERTIFICATE_KEY" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-gerencianetPixKey" --type String --value "$GERENCIANET_PIX_KEY" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-apiBotToken" --type String --value "$API_BOT_TOKEN" --overwrite

		echo "Secrets created"

		exit 0
	fi
done
