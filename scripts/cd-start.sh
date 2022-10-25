#!/bin/bash
cd /var/www/maite-api
PM2_HOME=/etc/pm2deamon pm2 delete "MAITE API"
PM2_HOME=/etc/pm2deamon pm2 start "yarn start" --name "MAITE API"
