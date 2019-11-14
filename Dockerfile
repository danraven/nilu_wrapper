FROM node:latest
WORKDIR /var/www/app
COPY yarn.lock package.json ./
RUN yarn install --frozen-lockfile --silent
COPY . .
