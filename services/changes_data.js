const ChangesDefind = {
  1: { name: "顶级买单", color: "price_up", direction: 1, pair: 2, id: 1, type: "sl" },
  2: { name: "顶级卖单", color: "price_down", direction: -1, pair: 1, id: 2, type: "sl" },
  4: { name: "封涨停板", color: "price_up", direction: 1, pair: 8, id: 4, type: "price" },
  8: { name: "封跌停板", color: "price_down", direction: -1, pair: 4, id: 8, type: "price" },
  16: { name: "打开涨停板", color: "price_down", direction: -1, pair: 32, id: 16, type: "price" },
  32: { name: "打开跌停板", color: "price_up", direction: 1, pair: 16, id: 32, type: "price" },
  64: { name: "有大买盘", color: "price_up", direction: 1, pair: 128, id: 64, type: "sl" },
  128: { name: "有大卖盘", color: "price_down", direction: -1, pair: 64, id: 128, type: "sl" },
  256: { name: "机构买单", color: "price_up", direction: 1, pair: 512, id: 256, type: "sl" },
  512: { name: "机构卖单", color: "price_down", direction: -1, pair: 256, id: 512, type: "sl" },
  8193: { name: "大笔买入", color: "price_up", direction: 1, pair: 8194, id: 8193, type: "sl" },
  8194: { name: "大笔卖出", color: "price_down", direction: -1, pair: 8193, id: 8194, type: "sl" },
  8195: { name: "拖拉机买", color: "price_up", direction: 1, pair: 8196, id: 8195, type: "sl" },
  8196: { name: "拖拉机卖", color: "price_down", direction: -1, pair: 8195, id: 8196, type: "sl" },
  8201: { name: "火箭发射", color: "price_up", direction: 1, pair: 8204, id: 8201, type: "change" },
  8202: { name: "快速反弹", color: "price_up", direction: 1, pair: 8203, id: 8202, type: "change" },
  8203: { name: "高台跳水", color: "price_down", direction: -1, pair: 8202, id: 8203, type: "change" },
  8204: { name: "加速下跌", color: "price_down", direction: -1, pair: 8201, id: 8204, type: "change" },
  8205: { name: "买入撤单", color: "price_down", direction: -1, pair: 8026, id: 8205, type: "sl" },
  8206: { name: "卖出撤单", color: "price_up", direction: 1, pair: 8205, id: 8206, type: "sl" },
  8207: { name: "竞价上涨", color: "price_up", direction: 1, pair: 8208, id: 8207, type: "change" },
  8208: { name: "竞价下跌", color: "price_down", direction: -1, pair: 8207, id: 8208, type: "change" },
  8209: { name: "高开5日线", color: "price_up", direction: 1, pair: 8210, id: 8209, type: "change" },
  8210: { name: "低开5日线", color: "price_down", direction: -1, pair: 8209, id: 8210, type: "change" },
  8211: { name: "向上缺口", color: "price_up", direction: 1, pair: 8212, id: 8211, type: "change" },
  8212: { name: "向下缺口", color: "price_down", direction: -1, pair: 8211, id: 8212, type: "change" },
  8213: { name: "60日新高", color: "price_up", direction: 1, pair: 8214, id: 8213, type: "price" },
  8214: { name: "60日新低", color: "price_down", direction: -1, pair: 8213, id: 8214, type: "price" },
  8215: { name: "60日大幅上涨", color: "price_up", direction: 1, pair: 8216, id: 8215, type: "change" },
  8216: { name: "60日大幅下跌", color: "price_down", direction: -1, pair: 8215, id: 8216, type: "change" },
};

function processStockData(data) {
  const groupedData = data.reduce((acc, v) => {
    if (!acc[v.change_id]) {
      acc[v.change_id] = [];
    }
    acc[v.change_id].push(v);
    return acc;
  }, {});

  return Object.entries(groupedData)
    .filter(([key]) => ChangesDefind.hasOwnProperty(key))
    .map(([key, list]) => {
      const { direction } = ChangesDefind[key];
      const sum = list.reduce((acc, curr) => acc + curr.cjl, 0);
      return {
        change_id: key,
        times: list.length,
        list,
        direction,
        sum
      };
    });
}

class StockChangesService {
  async getStockChangesByDay(detail) {
    try {
      if (Array.isArray(detail?.data?.data)) {
        const processedData = detail.data.data
          .map(v => ({
            change_id: v.t.toString(),
            time: v.tm,
            info: v.i.includes(',') ? v.i.substring(0, v.i.indexOf(',')) : v.i.toString(),
            price: v.p,
            zdf: v.u,
            cjl: v.v,
          }))
          .filter(v => ChangesDefind.hasOwnProperty(v.change_id));

        return processStockData(processedData);
      }
    } catch (error) {
      console.error('Error processing stock changes:', error);
    }
    return [];
  }
}

module.exports = StockChangesService;