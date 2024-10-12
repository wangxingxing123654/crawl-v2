const { getBrowserPage } = require('./browser');
const { getCache } = require('../utils/cache');
const logger = require('../utils/logger');
const StockChangesService = require('./changes_data');

async function fetchStockMovement(stockCode) {
  const page = getBrowserPage();
  const url = `https://quote.eastmoney.com/changes/stocks/${stockCode}.html`;
  const cls_url = `https://www.cls.cn/stock?code=${stockCode}`;

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 300000 });
    await page.waitForSelector(".sumtd", { timeout: 60000 });

    const detail = await getCache().get([stockCode]);
    let movementData = {
      bullishVolume: 0,
      bearishVolume: 0,
      url,
      cls_url
    };

    if (detail) {
      const formattedDetail = await new StockChangesService().getStockChangesByDay(detail);
      const { bearishVolume, bullishVolume } = calculateVolumes(formattedDetail);
      movementData = {
        ...movementData,
        detail: formattedDetail,
        bullishVolume,
        bearishVolume
      };
    }

    return movementData;
  } catch (error) {
    logger.error(`Cannot get ${stockCode} strange action data:`, error);
    return {
      bullishVolume: 0,
      bearishVolume: 0,
      url,
      cls_url
    };
  }
}

function calculateVolumes(data) {
  let bullishVolume = 0;
  let bearishVolume = 0;
  data.forEach(item => {
    if (item.direction === 1) {
      item.list.forEach(entry => {
        bullishVolume += entry.cjl;
      });
    } else if (item.direction === -1) {
      item.list.forEach(entry => {
        bearishVolume += entry.cjl;
      });
    }
  });
  return {
    bullishVolume: parseInt(bullishVolume),
    bearishVolume: parseInt(bearishVolume)
  };
}

async function updateHotStocks() {
  const page = getBrowserPage();
  try {
    const result = await getHot(page);
    await getCache().set("hotStocks", result);
    logger.info("Hot stocks data updated");
  } catch (error) {
    logger.error("Error updating hot stocks:", error);
  }
}

async function updateHotStocksWithMovement() {
  try {
    const hotStocks = await getCache().get("hotStocks");
    if (!hotStocks) {
      throw new Error("Hot stocks data not available");
    }
    const hotStocksWithMovement = await processLimitedStocks(hotStocks);
    await getCache().set("hotStocksWithMovement", hotStocksWithMovement);
    logger.info("Hot stocks data with movement updated");
  } catch (error) {
    logger.error("Error updating hot stocks with movement:", error);
  }
}

async function processLimitedStocks(stocks) {
  const results = [];
  const totalStocks = stocks.length;
  logger.info(`Processing ${totalStocks} stocks`);

  for (let i = 0; i < Math.min(50, totalStocks); i++) {
    const stock = stocks[i];
    try {
      const movementData = await fetchStockMovement(stock.code);
      results.push({ ...stock, ...movementData });
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 1000));
    } catch (error) {
      logger.error(`Error fetching stock movement for ${stock.code}:`, error);
      results.push(stock);
    }
  }

  if (totalStocks > 50) {
    results.push(...stocks.slice(50));
  }

  return results;
}

async function getHot(page, pageNum = 1, accumulatedData = []) {
  // Implementation of getHot function...
  // This function should be implemented based on your specific requirements
}

module.exports = {
  updateHotStocks,
  updateHotStocksWithMovement,
  getHot
};