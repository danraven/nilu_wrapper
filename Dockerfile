FROM node:latest
WORKDIR /var/www/app
COPY yarn.lock package.json /var/www/app/
RUN yarn install --frozen-lockfile --silent
COPY . /var/www/app
