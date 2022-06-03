const { createProxyMiddleware } = require('http-proxy-middleware');

// Just some Proxy Stuff for the SPotify API, can be ignored, but has to stay the same
module.exports = function (app) {
    app.use('/auth/**', 
        createProxyMiddleware({ 
            target: 'http://localhost:5000'
        })
    );
};