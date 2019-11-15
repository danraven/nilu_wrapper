const request = require('../helper/request.js');
const NotFoundError = require('../error/NotFoundError.js');
const InvalidParamsError = require('../error/InvalidParamsError.js');
const Validator = require('jsonschema').Validator;
const schema = require('./schema.json');

class ApiProxy {
    constructor(url, endpoints, storage, logger) {
        this.apiUrl = url;
        this.endpoints = endpoints;
        this.storage = storage;
        this.logger = logger;
        this.validator = new Validator();

        const schemaResult = this.validator.validate(this.endpoints, schema);
        if (!schemaResult.valid) {
            this.logger.error('Schema mismatch detected in endpoint definition list', { errors: schemaResult.errors });
            throw new Error('Error during parsing endpoint list');
        }
    }

    async get(path, queryParams = {}) {
        const definition = this.getDefinition("GET", path, queryParams);
        const fullPath = definition.path + definition.queryString;
        const resolvedFullPath = definition.resolvedPath + definition.queryString;

        const cached = await this.storage.get(fullPath);
        if (cached) {
            this.logger.info('Cached content found on path, returning', { fullPath, httpCode: cached.code, httpMessage: cached.message });
            return cached;
        }

        this.logger.info('Requested content not yet cached, fetching from third party', { fullPath, resolvedFullPath });
        const response = await this.storage.set(fullPath, await request.get(this.apiUrl + resolvedFullPath));
        this.logger.info('Content has been fetched and cached', { fullPath, resolvedFullPath, httpCode: response.code, httpMessage: response.message });

        return response;
    }

    getDefinition(method, path, queryParams = {}) {
        const definition = this.endpoints[`${method} ${path}`];
        const hasParams = Object.keys(queryParams).length;
        if (!definition) {
            throw new NotFoundError(method, path, queryParams);
        }

        if (hasParams || definition.queryParams) {
            const schema = {
                type: "object",
                properties: {
                    ...Object.entries(definition.queryParams || {}).reduce((acc, [key, val]) => ({ ...acc, [key]: { type: val } }), {})
                },
                additionalProperties: false
            };

            const result = this.validator.validate(queryParams, schema);
            if (!result.valid) {
                this.logger.info('Invalid query parameters received on path', { path, method, queryParams, errors: result.errors });
                throw new InvalidParamsError(method, path, queryParams, result.errors);
            }
        }

        return {
            method,
            path,
            resolvedPath: definition.targetPath,
            queryString: hasParams ? '?' + Object.keys(queryParams).sort().map(key => `${key}=${queryParams[key]}`).join('&') : ''
        };
    }
}

module.exports = ApiProxy;
