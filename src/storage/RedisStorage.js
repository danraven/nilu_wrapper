const redis = require('redis');
const { promisify } = require('util');

class RedisStorage {
    constructor(path) {
        this.client = redis.createClient(path);

        this.client.get = promisify(this.client.get).bind(this.client);
        this.client.set = promisify(this.client.set).bind(this.client);
        this.client.keys = promisify(this.client.keys).bind(this.client);
    }

    async get(key) {
        const response = await this.client.get(key);

        try {
            return JSON.parse(response);
        } catch (e) {
            return response;
        }
    }

    async set(key, value) {
        await this.client.set(key, (typeof value === 'object' && value !== null) ? JSON.stringify(value) : value);

        return value;
    }
}

module.exports = RedisStorage;
