#!/bin/bash

sudo chmod -R 777 /var/www/api-temp
sudo chmod -R 777 /var/www/api

cd /var/www/api-temp

yarn
yarn build:api

sudo mv api/* /var/www/api
sudo mv package.json /var/www/api
sudo mv node_modules /var/www/api
sudo rm -r /var/www/api-temp

cd /var/www/api

pm2 delete api
pm2 start "yarn start:api" --name "api"
