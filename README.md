# API Wrapper

## Introduction
Originally intended to be a wrapper around the API of [NILU.no](https://api.nilu.no/), this is a small service that can wrap any open REST API by acting as a cache layer on top of GET requests.

## Setup and installation

### Creating an environment file
Create a `.env` file in the root directory using the provided `.env.dist` as a base. It determines the storage driver used for caching, the URL address of the API to communicate with and the port the app should listen to.
By default it is set up to fetch from [`https://api.nilu.no`](https://api.nilu.no) using a Redis instance, with port `8080` exposed. With the default settings the app should build and run out of the box using `docker-compose` (see below).

### Installing dependencies

#### Using `docker-compose`
The easiest way to set up a working environment is by building a Docker image of the app and linking it with dependent services:
1. Run `docker-compose build` in the root directory to build the images
1. Run `docker-compose up -d` to start the containers in the background.

The dependencies should now be installed in `node_modules` and the app should run on `localhost:<LISTEN_PORT>`.
Note that `docker-compose.yml` is currently set up to run with Redis as a storage, so you'll need to change the image file if you want a different driver to be used (or you can remove the container entirely if `inmemory` is used).

#### Using `npm` or `yarn`
You can install dependencies without a container if you have `npm` or `yarn` installed by running `npm install` or `yarn install`.
You can run `npm run start` or `yarn start` to start the server once everything is set up and installed.

## Usage

Any `GET` request with a unique path sent to the app is forwarded to the third-party API and retrieves its response with the payload, MIME type, HTTP code and message. Every subsequent request to the same endpoint retrieves the same response without communicating with the external API, instead it uses the storage to fetch the appropriate data. This applies to every response, including non-200 ones as long as it's from the source API.

There is currently no way to reset or invalidate elements in the storage beside restarting the app server (if it's `inmemory`) or manually interacting with the storage server (or resetting the container).

## Logging

JSON-formatted log files are available in `server.log` and `error.log`.

## Tests

There are a few test cases for the API proxy module that can be run with `npm run test`, `yarn test` or `node_modules/.bin/jest`.

## Comments, todos

* I intended to write the API proxy in a way that its storage can be interchangeable, so a MongoDB or SQL implementation can also be possible. I chose Redis because of the schemaless approach, as the amount of data and the fields vary from endpoint to endpoint.
* The wrapper currently only works with HTTPS APIs (due to the default options of `https.get`) and only with `GET` endpoints. It shouldn't be overly difficult to expand it and even allow `POST` or `PUT` requests to be forwarded (without caching the result, of course).
* There is currently no sanitizing on the query string, e.g. `/users?foo=bar&baz=foo`, `/users?baz=foo&foo=bar` and `/users?foo=bar&baz=foo#` produce three API hits and three different cache keys even though the result is going to be the same.