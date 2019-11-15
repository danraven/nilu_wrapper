class InvalidParamsError extends Error {
    constructor(method, path, queryParams, errors) {
        super('Invalid query params supplied to path');
        this.method = method;
        this.path = path;
        this.queryParams = queryParams;
        this.errors = errors;
    }
}

module.exports = InvalidParamsError;