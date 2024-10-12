const cron = require('node-cron');
const { updateHotStocks, updateHotStocksWithMovement } = require('./stockService');
const logger = require('../utils/logger');
const config = require('../config');

function isTradingTime() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const time = hour * 60 + minute;

  return config.tradingTimes.some(({ start, end }) => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    return time >= startTime && time <= endTime;
  });
}

function isTradingDay() {
  const now = new Date();
  const day = now.getDay();
  return day >= 1 && day <= 5;
}

function setupCronJobs() {
  cron.schedule('*/10 * * * *', updateHotStocks);

  cron.schedule('*/5 * * * *', async () => {
    if (isTradingDay() && isTradingTime()) {
      try {
        await updateHotStocksWithMovement();
      } catch (error) {
        logger.error('Error during scheduled update in trading hours:', error);
      }
    } else {
      logger.info('Not a trading day or not in trading hours.');
    }
  });

  cron.schedule('0 * * * *', async () => {
    if (isTradingDay() && !isTradingTime()) {
      try {
        await updateHotStocksWithMovement();
      } catch (error) {
        logger.error('Error during scheduled update outside trading hours:', error);
      }
    } else {
      logger.info('Not a trading day or it is not the scheduled hour.');
    }
  });

  logger.info('Cron jobs set up successfully');
}

module.exports = {
  setupCronJobs
};