const https = require('https');

function get(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, res => {
            const response = {
                body: '',
                code: res.statusCode,
                type: res.headers['content-type'],
                message: res.statusMessage,
                ok: res.statusCode >= 200 && res.statusCode < 300
            };

            res.on('data', chunk => response.body += chunk);
            res.on('end', () => resolve(response));
        });

        req.on('error', e => reject(e));
    });
}

module.exports = {
    get
};