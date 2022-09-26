FROM node:14

WORKDIR /app

COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock

RUN yarn

# Copy files

ADD . .

CMD yarn deploy:all
