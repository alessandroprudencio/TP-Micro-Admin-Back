FROM node:16-alpine

RUN apk add --no-cache bash

RUN yarn global add @nestjs/cli

WORKDIR /usr/tennis-player/tp-micro-admin

COPY . .

RUN yarn

RUN yarn run build

CMD ["yarn", "run", "start:dev"]   