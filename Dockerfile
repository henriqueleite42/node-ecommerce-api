FROM node:14

WORKDIR /app

COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock

RUN yarn

# Create layer

COPY ./package.json ./layers/modules/package.json
COPY ./yarn.lock ./layers/modules/yarn.lock

RUN cd ./layers/modules && yarn install --production && cd ..

# Copy files

ADD ./src ./src
ADD ./resources-auth.ts ./resources-auth.ts
ADD ./resources-general.ts ./resources-general.ts
ADD ./resources-vod.ts ./resources-vod.ts
ADD ./serverless.ts ./serverless.ts
ADD ./tsconfig.json ./tsconfig.json
ADD ./tsconfig.paths.json ./tsconfig.paths.json

RUN cd ./layers/modules
RUN ls

CMD yarn dev
