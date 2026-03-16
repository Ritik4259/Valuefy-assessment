const express = require('express');
const repository = require('../db/repository');
const rebalanceService = require('../services/rebalanceService');

const router = express.Router();

function parseAllocationValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

router.get('/', (req, res) => {
  res.redirect('/comparison');
});

router.get('/comparison', async (req, res, next) => {
  try {
    const comparison = await rebalanceService.buildComparisonData();

    res.render('comparison', {
      pageTitle: 'Comparison',
      activePage: 'comparison',
      comparison,
      successMessage: req.query.updated
        ? 'Model allocation updated and comparison recalculated.'
        : req.query.saved
          ? 'Rebalancing session saved successfully.'
          : null
    });
  } catch (error) {
    next(error);
  }
});

router.post('/comparison/save', async (req, res, next) => {
  try {
    await rebalanceService.saveCurrentRebalance();
    res.redirect('/history?saved=1');
  } catch (error) {
    next(error);
  }
});

router.get('/holdings', async (req, res, next) => {
  try {
    const holdingsData = await rebalanceService.getHoldingsData();

    res.render('holdings', {
      pageTitle: 'Holdings',
      activePage: 'holdings',
      holdingsData
    });
  } catch (error) {
    next(error);
  }
});

router.get('/history', async (req, res, next) => {
  try {
    const historyData = await rebalanceService.getHistoryData();

    res.render('history', {
      pageTitle: 'History',
      activePage: 'history',
      historyData,
      successMessage: req.query.saved
        ? 'Rebalancing session saved with PENDING status.'
        : null
    });
  } catch (error) {
    next(error);
  }
});

router.get('/plan/edit', async (req, res, next) => {
  try {
    const modelFunds = await repository.getModelFunds();

    res.render('plan-edit', {
      pageTitle: 'Edit Plan',
      activePage: 'plan-edit',
      modelFunds: modelFunds.map((fund) => ({
        fundId: fund.fund_id,
        fundName: fund.fund_name,
        assetClass: fund.asset_class,
        allocationPct: Number(fund.allocation_pct)
      })),
      errorMessage: null,
      successMessage: null
    });
  } catch (error) {
    next(error);
  }
});

router.post('/plan/edit', async (req, res, next) => {
  try {
    const modelFunds = await repository.getModelFunds();
    const updatedFunds = modelFunds.map((fund) => ({
      fundId: fund.fund_id,
      fundName: fund.fund_name,
      assetClass: fund.asset_class,
      allocationPct: parseAllocationValue(req.body[`allocation_${fund.fund_id}`])
    }));

    const hasInvalidNumber = updatedFunds.some(
      (fund) => Number.isNaN(fund.allocationPct) || fund.allocationPct < 0
    );

    if (hasInvalidNumber) {
      res.status(400).render('plan-edit', {
        pageTitle: 'Edit Plan',
        activePage: 'plan-edit',
        modelFunds: updatedFunds,
        errorMessage: 'Enter valid non-negative percentages for every model fund.',
        successMessage: null
      });
      return;
    }

    const totalAllocation = updatedFunds.reduce(
      (sum, fund) => sum + fund.allocationPct,
      0
    );

    if (Math.abs(totalAllocation - 100) > 0.0001) {
      res.status(400).render('plan-edit', {
        pageTitle: 'Edit Plan',
        activePage: 'plan-edit',
        modelFunds: updatedFunds,
        errorMessage: `Total allocation must equal exactly 100. Current total is ${totalAllocation.toFixed(2)}.`,
        successMessage: null
      });
      return;
    }

    await repository.updateModelAllocations(updatedFunds);
    res.redirect('/comparison?updated=1');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
