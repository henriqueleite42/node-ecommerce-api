#!/bin/sh

docker container rm maite-api_localstack -f
docker container rm maite-api_docker-events-listener -f

docker image rm api_docker-events-listener -f
docker image rm maite-api_api -f
docker image rm maite-api_api -f
