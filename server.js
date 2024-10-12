const https = require('https');
const http = require('http');
const fs = require('fs');
const config = require('./config');

function createServer(app) {
  if (config.nodeEnv === 'production') {
    const options = {
      key: fs.readFileSync("/etc/letsencrypt/live/zlala.top/privkey.pem"),
      cert: fs.readFileSync("/etc/letsencrypt/live/zlala.top/fullchain.pem")
    };
    return https.createServer(options, app);
  } else {
    return http.createServer(app);
  }
}

module.exports = {
  createServer
};