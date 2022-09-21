#!/bin/bash

# You need to change this if you changed the one at src/config/index.ts
SERVICE_NAME=monolith

docker events --filter 'event=create'  --filter 'event=start' --filter 'type=container' --format '{{.Actor.Attributes.name}} {{.Status}}' | while read event_info

do
	event_infos=($event_info)
	container_name=${event_infos[0]}
	event=${event_infos[1]}

	echo "$container_name: status = ${event}"

	if [[ $container_name = "monolith_localstack" ]] && [[ $event == "start" ]]; then
		echo "Sleeping"

		sleep 15 # let localstack some time to start

		echo "Creating Database"

		aws --endpoint-url=http://localstack:4566 rds create-db-instance \
				--engine postgres \
				--db-instance-identifier postgresdb \
				--db-instance-class db.t4g.micro \
				--publicly-accessible

		echo "Creating Secrets"

		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-pgUser" --type String --value "test" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-pgDb" --type String --value "test" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-pgPass" --type String --value "123" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-pgHost" --type String --value "localhost" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-pgPort" --type String --value "4510" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-sourceEmailToSendEmails" --type String --value "foo@bar.com" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-imageDomainUrl" --type String --value "http://localhost" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-videoDomainUrl" --type String --value "http://localhost" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-rawVideoDomainUrl" --type String --value "http://localhost" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-jwtSecret" --type String --value "fake" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-discordClientId" --type String --value "fake" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-discordClientSecret" --type String --value "fake" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-discordRedirectUrl" --type String --value "http://localhost" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-discordBotToken" --type String --value "fake" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-googleClientId" --type String --value "fake" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-googleClientSecret" --type String --value "fake" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-googleRedirectUrl" --type String --value "http://localhost" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-appleClientId" --type String --value "fake" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-appleClientSecret" --type String --value "fake" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-appleRedirectUrl" --type String --value "http://localhost" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-twitchClientId" --type String --value "fake" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-twitchClientSecret" --type String --value "fake" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-twitchRedirectUrl" --type String --value "http://localhost" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-twitchAppAccessToken" --type String --value "fake" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-twitchEventHandlerUrl" --type String --value "http://localhost" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-microsoftClientId" --type String --value "fake" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-microsoftClientSecret" --type String --value "fake" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-microsoftRedirectUrl" --type String --value "http://localhost" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-spotifyClientId" --type String --value "fake" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-spotifyClientSecret" --type String --value "fake" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-spotifyRedirectUrl" --type String --value "http://localhost" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-captisAuthBaseUrl" --type String --value "http://auth.localhost" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-magicUrlPrefix" --type String --value "http://magiclinks.localhost" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-androidBundleId" --type String --value "http://localhost.android" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-iosBundleId" --type String --value "http://localhost.ios" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-vodSolutionIdentifier" --type String --value "AwsSolution/fake/fake" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-vodDynamoDbTable" --type String --value "fake" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-vodEndPoint" --type String --value "http://fake.amazonaws.com" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-vodMediaConvertRole" --type String --value "fake" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-vodSource" --type String --value "vod-dev-source-fake" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-vodDestination" --type String --value "vod-dev-destination-fake" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-vodCloudFront" --type String --value "fake.cloudfront.net" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-vodIngestWorkflow" --type String --value "fake-ingest" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-vodProcessWorkflow" --type String --value "fake-process" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-vodPublishWorkflow" --type String --value "fake-publish" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-errorHandlerLambda" --type String --value "fake" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-firebaseApiToken" --type String --value "fake" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-cloudMessagingApiKey" --type String --value "fake" --overwrite
		aws --endpoint-url=http://localstack:4566 ssm put-parameter --name "$SERVICE_NAME-local-twitchWebhookSecret" --type String --value "fake" --overwrite

		exit 0
	fi
done
