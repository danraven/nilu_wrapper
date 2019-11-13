class InMemoryStorage {
    constructor() {
        this.storage = {};
    }

    async set(key, value) {
        if (key in this.storage) {
            throw new Error(`Key "${key}" already exists in storage.`);
        }

        this.storage[key] = value;

        return value;
    }

    async get(key) {
        return this.storage[key];
    }
}

module.exports = InMemoryStorage;