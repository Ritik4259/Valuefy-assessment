const repository = require('../db/repository');

function roundRupees(value) {
  return Math.round(Number(value || 0));
}

function calculatePercent(value, total) {
  if (!total) {
    return 0;
  }

  return (Number(value || 0) / total) * 100;
}

async function getAmitDashboardData() {
  const client = await repository.getAmitClient();

  if (!client) {
    throw new Error('Amit Sharma was not found in the clients table.');
  }

  const [modelFunds, holdings] = await Promise.all([
    repository.getModelFunds(),
    repository.getClientHoldings(client.client_id)
  ]);

  return {
    client,
    modelFunds,
    holdings
  };
}

async function buildComparisonData() {
  const { client, modelFunds, holdings } = await getAmitDashboardData();
  const totalPortfolioValue = holdings.reduce(
    (sum, holding) => sum + Number(holding.current_value || 0),
    0
  );

  const holdingByFundId = new Map(
    holdings.map((holding) => [holding.fund_id, holding])
  );
  const modelFundIds = new Set(modelFunds.map((fund) => fund.fund_id));

  const comparisonItems = modelFunds.map((fund) => {
    const holding = holdingByFundId.get(fund.fund_id);
    const currentValue = Number(holding ? holding.current_value : 0);
    const currentPct = calculatePercent(currentValue, totalPortfolioValue);
    const targetPct = Number(fund.allocation_pct);
    const driftPct = targetPct - currentPct;
    const action = driftPct > 0 ? 'BUY' : driftPct < 0 ? 'SELL' : 'HOLD';
    const amount =
      action === 'HOLD'
        ? 0
        : roundRupees((Math.abs(driftPct) / 100) * totalPortfolioValue);

    return {
      fundId: fund.fund_id,
      fundName: fund.fund_name,
      currentValue,
      currentPct,
      targetPct,
      driftPct,
      action,
      amount,
      isModelFund: true,
      postRebalancePct: targetPct
    };
  });

  const reviewItems = holdings
    .filter((holding) => !modelFundIds.has(holding.fund_id))
    .map((holding) => {
      const currentValue = Number(holding.current_value || 0);
      const currentPct = calculatePercent(currentValue, totalPortfolioValue);

      return {
        fundId: holding.fund_id,
        fundName: holding.fund_name,
        currentValue,
        currentPct,
        targetPct: null,
        driftPct: null,
        action: 'REVIEW',
        amount: roundRupees(currentValue),
        isModelFund: false,
        postRebalancePct: currentPct
      };
    });

  const allItems = [...comparisonItems, ...reviewItems];
  const totalToBuy = allItems
    .filter((item) => item.action === 'BUY')
    .reduce((sum, item) => sum + item.amount, 0);
  const totalToSell = allItems
    .filter((item) => item.action === 'SELL')
    .reduce((sum, item) => sum + item.amount, 0);

  return {
    client,
    totalPortfolioValue,
    holdings,
    comparisonItems: allItems,
    summary: {
      totalToBuy,
      totalToSell,
      netCashNeeded: totalToBuy - totalToSell
    }
  };
}

async function saveCurrentRebalance() {
  const comparison = await buildComparisonData();
  const createdAt = new Date().toISOString();

  const sessionId = await repository.saveRebalanceSession(
    {
      clientId: comparison.client.client_id,
      createdAt,
      portfolioValue: comparison.totalPortfolioValue,
      totalToBuy: comparison.summary.totalToBuy,
      totalToSell: comparison.summary.totalToSell,
      netCashNeeded: comparison.summary.netCashNeeded,
      status: 'PENDING'
    },
    comparison.comparisonItems.map((item) => ({
      fundId: item.fundId,
      fundName: item.fundName,
      // The table only accepts BUY, SELL, and REVIEW. A zero-drift model fund is
      // effectively already on target, so it is stored as BUY with amount 0.
      action: item.action === 'HOLD' ? 'BUY' : item.action,
      amount: item.amount,
      currentPct: item.currentPct,
      targetPct: item.targetPct,
      postRebalancePct: item.postRebalancePct,
      isModelFund: item.isModelFund
    }))
  );

  return sessionId;
}

async function getHoldingsData() {
  const { client, holdings } = await getAmitDashboardData();
  const totalPortfolioValue = holdings.reduce(
    (sum, holding) => sum + Number(holding.current_value || 0),
    0
  );

  return {
    client,
    holdings,
    totalPortfolioValue
  };
}

async function getHistoryData() {
  const client = await repository.getAmitClient();

  if (!client) {
    throw new Error('Amit Sharma was not found in the clients table.');
  }

  const sessions = await repository.getRebalanceHistory(client.client_id);

  return {
    client,
    sessions
  };
}

module.exports = {
  buildComparisonData,
  saveCurrentRebalance,
  getHoldingsData,
  getHistoryData
};
