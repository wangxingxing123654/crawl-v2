const path = require('path');

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientPath: path.join(__dirname, 'client/dist'),
  cacheBasePath: './cache',
  puppeteerOptions: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: process.env.NODE_ENV === 'production',
    ignoreHTTPSErrors: true,
    protocolTimeout: 30000
  },
  cacheOptions: {
    ttl: 600,
    hash: 'sha1'
  },
  tradingTimes: [
    { start: '09:30', end: '11:30' },
    { start: '13:00', end: '15:00' }
  ]
};