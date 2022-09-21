# Sources
#
# https://baptiste.bouchereau.pro/tutorial/automatic-provisioning-of-localstack/
# https://stackoverflow.com/questions/61918972/how-to-install-aws-cli-on-alpine#answer-62137985
#

FROM docker:19.03.5

RUN apk update && \
    apk upgrade && \
    apk add --no-cache bash wget unzip

# Install AWS CLI
RUN apk add --no-cache \
        python3 \
        py3-pip \
    && pip3 install --upgrade pip \
    && pip3 install --no-cache-dir \
        awscli \
    && rm -rf /var/cache/apk/*

RUN aws --version

COPY aws_credentials.txt /root/.aws/credentials
COPY aws_config.txt /root/.aws/config

COPY listen-docker-events.sh /var/listen-docker-events.sh

CMD ["/bin/bash", "/var/listen-docker-events.sh"]
