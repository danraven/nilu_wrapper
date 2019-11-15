class NotFoundError extends Error {
    constructor(method, path) {
        super('Path not found in endpoint definition');
        this.method = method;
        this.path = path;
    }
}

module.exports = NotFoundError;