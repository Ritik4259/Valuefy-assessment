const db = require('./database');

const AMIT_NAME = 'Amit Sharma';

async function getAmitClient() {
  return db.get(
    `
      SELECT client_id, client_name, total_invested
      FROM clients
      WHERE client_name = ?
      LIMIT 1
    `,
    [AMIT_NAME]
  );
}

async function getModelFunds() {
  return db.all(
    `
      SELECT fund_id, fund_name, asset_class, allocation_pct
      FROM model_funds
      ORDER BY fund_id
    `
  );
}

async function getClientHoldings(clientId) {
  return db.all(
    `
      SELECT holding_id, client_id, fund_id, fund_name, current_value
      FROM client_holdings
      WHERE client_id = ?
      ORDER BY holding_id
    `,
    [clientId]
  );
}

async function getRebalanceHistory(clientId) {
  return db.all(
    `
      SELECT session_id, client_id, created_at, portfolio_value, total_to_buy,
             total_to_sell, net_cash_needed, status
      FROM rebalance_sessions
      WHERE client_id = ?
      ORDER BY datetime(created_at) DESC, session_id DESC
    `,
    [clientId]
  );
}

async function updateModelAllocations(updates) {
  await db.run('BEGIN TRANSACTION');

  try {
    for (const update of updates) {
      await db.run(
        `
          UPDATE model_funds
          SET allocation_pct = ?
          WHERE fund_id = ?
        `,
        [update.allocationPct, update.fundId]
      );
    }

    await db.run('COMMIT');
  } catch (error) {
    await db.run('ROLLBACK');
    throw error;
  }
}

async function saveRebalanceSession(sessionInput, items) {
  await db.run('BEGIN TRANSACTION');

  try {
    const sessionResult = await db.run(
      `
        INSERT INTO rebalance_sessions (
          client_id,
          created_at,
          portfolio_value,
          total_to_buy,
          total_to_sell,
          net_cash_needed,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        sessionInput.clientId,
        sessionInput.createdAt,
        sessionInput.portfolioValue,
        sessionInput.totalToBuy,
        sessionInput.totalToSell,
        sessionInput.netCashNeeded,
        sessionInput.status
      ]
    );

    for (const item of items) {
      await db.run(
        `
          INSERT INTO rebalance_items (
            session_id,
            fund_id,
            fund_name,
            action,
            amount,
            current_pct,
            target_pct,
            post_rebalance_pct,
            is_model_fund
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          sessionResult.lastID,
          item.fundId,
          item.fundName,
          item.action,
          item.amount,
          item.currentPct,
          item.targetPct,
          item.postRebalancePct,
          item.isModelFund ? 1 : 0
        ]
      );
    }

    await db.run('COMMIT');
    return sessionResult.lastID;
  } catch (error) {
    await db.run('ROLLBACK');
    throw error;
  }
}

module.exports = {
  getAmitClient,
  getModelFunds,
  getClientHoldings,
  getRebalanceHistory,
  updateModelAllocations,
  saveRebalanceSession
};
