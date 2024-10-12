const puppeteer = require('puppeteer');
const config = require('../config');
const logger = require('../utils/logger');

let browser;
let page;

async function initBrowser() {
  try {
    browser = await puppeteer.launch(config.puppeteerOptions);
    page = await browser.newPage();
    await setupPageInterception(page);
    logger.info('Browser initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize browser:', error);
    throw error;
  }
}

async function setupPageInterception(page) {
  await page.setRequestInterception(true);
  page.on('request', (interceptedRequest) => {
    if (interceptedRequest.resourceType() === 'image' || interceptedRequest.resourceType() === 'stylesheet') {
      interceptedRequest.abort();
    } else {
      interceptedRequest.continue();
    }
  });
}

async function closeBrowser() {
  if (browser) {
    await browser.close();
    logger.info('Browser closed successfully');
  }
}

function getBrowserPage() {
  return page;
}

module.exports = {
  initBrowser,
  closeBrowser,
  getBrowserPage
};