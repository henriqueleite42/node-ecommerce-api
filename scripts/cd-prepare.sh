#!/bin/bash

sudo rm -r /var/www/maite-api
sudo mkdir /var/www/maite-api
sudo chmod -R 777 /var/www/maite-api

cd /var/www/maite-api

sudo yarn install --production=true --frozen-lockfile
