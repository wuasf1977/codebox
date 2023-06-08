FROM node:latest
EXPOSE 3000
COPY ./ /app
WORKDIR /app

RUN apt-get update &&\
    npm install -r package.json

ENTRYPOINT [ "node", "server.js" ]