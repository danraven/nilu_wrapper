const InMemoryStorage = require('./InMemoryStorage.js');
const RedisStorage = require('./RedisStorage.js');

module.exports = {
    createStorage: type => {
        switch (type) {
            case 'inmemory': return new InMemoryStorage();
            case 'redis': return new RedisStorage(process.env.REDIS_URL);
            default:
                throw new Error(`Storage type "${type}" not supported`);
        }
    }
};
