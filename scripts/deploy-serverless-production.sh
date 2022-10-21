#!/bin/bash

API_MODULE="ACCOUNT" yarn deploy:production && \
API_MODULE="BLACKLIST" yarn deploy:production && \
API_MODULE="CONTENT" yarn deploy:production && \
API_MODULE="COUNTER" yarn deploy:production && \
API_MODULE="COUPON" yarn deploy:production && \
API_MODULE="DISCORD" yarn deploy:production && \
API_MODULE="EVENT-ALERT" yarn deploy:production && \
API_MODULE="PRODUCT" yarn deploy:production && \
API_MODULE="SALE" yarn deploy:production && \
API_MODULE="STORE" yarn deploy:production && \
API_MODULE="UPLOAD" yarn deploy:production && \
API_MODULE="WALLET" yarn deploy:production
