#!/bin/bash
cd /var/www/maite-api

pm2 delete "MAITE API"

pm2 start "yarn start:api" --name "MAITE API"
