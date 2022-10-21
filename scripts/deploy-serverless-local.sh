#!/bin/bash

API_MODULE="ACCOUNT" yarn deploy:local && \
API_MODULE="BLACKLIST" yarn deploy:local && \
API_MODULE="CONTENT" yarn deploy:local && \
API_MODULE="COUNTER" yarn deploy:local && \
API_MODULE="COUPON" yarn deploy:local && \
API_MODULE="DISCORD" yarn deploy:local && \
API_MODULE="EVENT-ALERT" yarn deploy:local && \
API_MODULE="PRODUCT" yarn deploy:local && \
API_MODULE="SALE" yarn deploy:local && \
API_MODULE="STORE" yarn deploy:local && \
API_MODULE="UPLOAD" yarn deploy:local && \
API_MODULE="WALLET" yarn deploy:local
