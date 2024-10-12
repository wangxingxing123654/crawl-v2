const express = require('express');
const { getCache } = require('../utils/cache');
const logger = require('../utils/logger');

const router = express.Router();

router.get("/stocks", async (req, res) => {
  try {
    let hotStocks = await getCache().get("hotStocksWithMovement");
    if (!hotStocks) {
      return res.json([]);
    }
    res.json(hotStocks);
  } catch (error) {
    logger.error("Error fetching stocks:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/hot", async (req, res) => {
  try {
    const hotStocks = await getCache().get("hotStocks");
    if (!hotStocks) {
      return res.json([]);
    }
    res.json(hotStocks);
  } catch (error) {
    logger.error("Error fetching hot stocks:", error);
    res.status(500).send("Internal Server Error");
  }
});

function setupRoutes(app) {
  app.use('/api', router);
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
}

module.exports = {
  setupRoutes
};