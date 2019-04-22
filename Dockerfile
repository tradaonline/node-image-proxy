FROM node:10.15.3-alpine
MAINTAINER marcjacobs1021@gmail.com

COPY . /node-image-proxy

WORKDIR /node-image-proxy

RUN npm install

ENV NODE_ENV=production

EXPOSE 3000

CMD npm start
