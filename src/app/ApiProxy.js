const request = require('./request.js');

class ApiProxy {
    constructor(url, storage, logger) {
        this.apiUrl = url;
        this.storage = storage;
        this.logger = logger;
    }

    async get(path) {
        const cached = await this.storage.get(path);
        if (cached !== undefined) {
            this.logger.info('Cached content found on path, returning', { path, httpCode: cached.code, httpMessage: cached.message });
            return cached;
        }
        
        this.logger.info('Requested content not yet cached, fetching from third party', { path });
        const response = await this.storage.set(path, await request(this.apiUrl + path));
        this.logger.info('Content has been fetched and cached', { path, httpCode: response.code, httpMessage: response.message });

        return response;
    }
}

module.exports = ApiProxy;