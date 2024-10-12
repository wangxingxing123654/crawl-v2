const express = require('express');
const cors = require('cors');
const path = require('path');
const { initBrowser } = require('./services/browser');
const { setupCronJobs } = require('./services/cron');
const { setupRoutes } = require('./routes');
const { createServer } = require('./server');
const config = require('./config');
const logger = require('./utils/logger');

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, 'client/dist')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupRoutes(app);

async function startServer() {
  logger.info(`Starting server in ${process.env.NODE_ENV} mode`);

  const server = createServer(app);

  server.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
  });

  await initBrowser();
  await setupCronJobs();
}

startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  logger.info('Shutting down server');
  await require('./services/browser').closeBrowser();
  process.exit();
});