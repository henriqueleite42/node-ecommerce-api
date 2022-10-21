#!/bin/bash

API_MODULE="ACCOUNT" yarn deploy:dev && \
API_MODULE="BLACKLIST" yarn deploy:dev && \
API_MODULE="CONTENT" yarn deploy:dev && \
API_MODULE="COUNTER" yarn deploy:dev && \
API_MODULE="COUPON" yarn deploy:dev && \
API_MODULE="DISCORD" yarn deploy:dev && \
API_MODULE="EVENT-ALERT" yarn deploy:dev && \
API_MODULE="PRODUCT" yarn deploy:dev && \
API_MODULE="SALE" yarn deploy:dev && \
API_MODULE="STORE" yarn deploy:dev && \
API_MODULE="UPLOAD" yarn deploy:dev && \
API_MODULE="WALLET" yarn deploy:dev
