// backend/utils/commissionCalculator.js
const Settings = require('../models/Settings');

/**
 * Calculate commission based on project value
 * @param {number} projectValue - Total project value in rupees
 * @param {number} customRate - Optional custom commission rate (overrides settings)
 * @returns {object} Commission details
 */
const calculateCommission = async (projectValue, customRate = null) => {
  try {
    // Get commission rate from settings
    let commissionRate = 15; // Default rate
    
    if (customRate !== null) {
      commissionRate = customRate;
    } else {
      const settings = await Settings.findOne();
      if (settings && settings.commissionRate) {
        commissionRate = settings.commissionRate;
      }
    }

    // Calculate commission amount
    const commissionAmount = (projectValue * commissionRate) / 100;

    // Calculate net amount (what business keeps)
    const netAmount = projectValue - commissionAmount;

    return {
      projectValue,
      commissionRate,
      commissionAmount,
      netAmount,
      currency: '₹'
    };
  } catch (error) {
    console.error('Commission calculation error:', error.message);
    throw error;
  }
};

/**
 * Calculate total earnings for a partner
 * @param {array} referrals - Array of referral objects with project values
 * @returns {object} Total earnings summary
 */
const calculatePartnerEarnings = async (referrals) => {
  try {
    let totalProjectValue = 0;
    let totalCommission = 0;
    const breakdown = [];

    for (const referral of referrals) {
      const commission = await calculateCommission(referral.projectValue);
      totalProjectValue += referral.projectValue;
      totalCommission += commission.commissionAmount;
      
      breakdown.push({
        referralId: referral.id,
        projectValue: referral.projectValue,
        commission: commission.commissionAmount,
        date: referral.date
      });
    }

    return {
      totalReferrals: referrals.length,
      totalProjectValue,
      totalCommission,
      averageCommissionPerReferral: referrals.length > 0 ? totalCommission / referrals.length : 0,
      breakdown
    };
  } catch (error) {
    console.error('Partner earnings calculation error:', error.message);
    throw error;
  }
};

/**
 * Calculate monthly commission summary
 * @param {array} referrals - Array of referral objects with dates
 * @returns {object} Monthly breakdown
 */
const calculateMonthlyCommission = async (referrals) => {
  try {
    const monthlyData = {};

    for (const referral of referrals) {
      const date = new Date(referral.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          totalReferrals: 0,
          totalProjectValue: 0,
          totalCommission: 0
        };
      }

      const commission = await calculateCommission(referral.projectValue);
      monthlyData[monthKey].totalReferrals += 1;
      monthlyData[monthKey].totalProjectValue += referral.projectValue;
      monthlyData[monthKey].totalCommission += commission.commissionAmount;
    }

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  } catch (error) {
    console.error('Monthly commission calculation error:', error.message);
    throw error;
  }
};

/**
 * Validate commission rate
 * @param {number} rate - Commission rate to validate
 * @returns {boolean} Is valid
 */
const validateCommissionRate = (rate) => {
  return typeof rate === 'number' && rate >= 0 && rate <= 100;
};

module.exports = {
  calculateCommission,
  calculatePartnerEarnings,
  calculateMonthlyCommission,
  validateCommissionRate
};

/**
 * USAGE EXAMPLES:
 * 
 * 1. Calculate commission for a project:
 *    const result = await calculateCommission(15000);
 *    // { projectValue: 15000, commissionRate: 15, commissionAmount: 2250, netAmount: 12750 }
 * 
 * 2. Calculate partner total earnings:
 *    const referrals = [
 *      { id: '1', projectValue: 15000, date: '2025-01-15' },
 *      { id: '2', projectValue: 30000, date: '2025-01-20' }
 *    ];
 *    const earnings = await calculatePartnerEarnings(referrals);
 *    // { totalReferrals: 2, totalCommission: 6750, ... }
 * 
 * 3. Get monthly breakdown:
 *    const monthly = await calculateMonthlyCommission(referrals);
 *    // [{ month: '2025-01', totalReferrals: 2, totalCommission: 6750 }]
 */