let getResponses = {};
let history = [];

module.exports = {
    expectGetResponse: (url, body, code = 200, message = 'OK', type = 'application/json') => {
        getResponses[url] = {
            code,
            type,
            message,
            body,
            ok: code >= 200 && code < 300
        };
    },
    getLastResponse: () => !!history.length ? history[history.length - 1] : null,
    clear: () => {
        getResponses = {};
        history = [];
    },
    requestCount: () => history.length,
    get: async url => {
        const response = getResponses[url] || {
            code: 404,
            ok: false,
            type: 'text/plain',
            message: 'Not Found',
            body: ''
        };

        history.push({
            url: url,
            ...response
        });
        return response;
    }
};