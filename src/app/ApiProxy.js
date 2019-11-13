const request = require('./request.js');

class ApiProxy {
    constructor(options) {
        this.storage = options.storage;
        this.apiUrl = options.apiUrl;
    }

    async get(path) {
        const cached = await this.storage.get(path);
        if (cached !== undefined) {
            return cached;
        }
        
        return this.storage.set(path, await request(this.apiUrl + path));
    }
}

module.exports = ApiProxy;