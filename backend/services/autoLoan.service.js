const db = require('../db/db');

const LOAN_CONFIG = {
  SAVINGS_MULTIPLIER: 3,
  MIN_MEMBERSHIP_MONTHS: 3,
  CONSISTENCY_CHECK_MONTHS: 6
};

// Helper: Calculate months difference
const getMonthDiff = (d1, d2) => {
  let months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
};

const calculateMaxLoan = async (memberId) => {
  try {
    const conn = await db.getConnection();
    
    // 1. Check Membership Duration (via members.created_at)
    // We expect the 'created_at' column to exist on members table.
    const [memberData] = await conn.query(
      "SELECT created_at FROM members WHERE id = ?",
      [memberId]
    );

    if (memberData.length === 0) {
       return { eligible: false, limit: 0, reason: "Member not found." };
    }

    const joinDate = memberData[0].created_at ? new Date(memberData[0].created_at) : new Date();
    const membershipMonths = getMonthDiff(joinDate, new Date());
    
    if (membershipMonths < LOAN_CONFIG.MIN_MEMBERSHIP_MONTHS) {
      return { 
        eligible: false, 
        limit: 0, 
        reason: `Membership duration (${membershipMonths} months) is less than required minimum (${LOAN_CONFIG.MIN_MEMBERSHIP_MONTHS} months).` 
      };
    }

    // 2. Check Active Loans (Unpaid)
    // Assuming 'active' or 'pending' means unpaid/in-progress.
    // Also check if 'payedAmount' < 'amountTopay' for active loans just in case.
    const [activeLoans] = await conn.query(
      "SELECT * FROM loan WHERE memberId = ? AND status IN ('active', 'pending')", 
      [memberId]
    );
    
    if (activeLoans.length > 0) {
      return { eligible: false, limit: 0, reason: "Member has an active or pending loan." };
    }

    // 3. Calculate Total Savings
    const [savings] = await conn.query(
      "SELECT SUM(numberOfShares * shareValue) as total FROM savings WHERE memberId = ?",
      [memberId]
    );
    const totalSavings = Number(savings[0].total || 0);
    
    if (totalSavings <= 0) {
      return { eligible: false, limit: 0, reason: "Total savings is zero." };
    }

    // 4. Calculate Factors
    let baseLimit = totalSavings * LOAN_CONFIG.SAVINGS_MULTIPLIER;
    let consistencyFactor = 1.0;
    let repaymentFactor = 1.0;

    // Consistency: Check savings in last N months
    const [consistency] = await conn.query(
      "SELECT COUNT(DISTINCT DATE_FORMAT(date, '%Y-%m')) as months_saved FROM savings WHERE memberId = ? AND date >= DATE_SUB(NOW(), INTERVAL ? MONTH)",
      [memberId, LOAN_CONFIG.CONSISTENCY_CHECK_MONTHS]
    );
    const monthsSaved = consistency[0].months_saved || 0;
    
    // Simple logic: If saved < 50% of check period, reduce factor
    if (monthsSaved < (LOAN_CONFIG.CONSISTENCY_CHECK_MONTHS / 2)) {
      consistencyFactor = 0.8;
    } else if (monthsSaved === 0) {
        consistencyFactor = 0.5;
    }

    // Repayment: Check penalties
    const [penalties] = await conn.query(
        "SELECT COUNT(*) as count FROM penalties WHERE memberId = ? AND pstatus = 'wait'",
        [memberId]
    );
    if (penalties[0].count > 0) {
        repaymentFactor = 0.0; // Ineligible if active penalties
        return { eligible: false, limit: 0, reason: "Member has unpaid penalties." };
    }

    // Final Calculation
    const maxLoan = Math.floor(baseLimit * consistencyFactor * repaymentFactor);

    // Log the calculation (Fire and forget, or await)
    await conn.query(
      "INSERT INTO loan_eligibility_logs (member_id, total_savings, base_limit, consistency_factor, repayment_factor, final_limit, is_eligible) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [memberId, totalSavings, baseLimit, consistencyFactor, repaymentFactor, maxLoan, maxLoan > 0]
    );

    conn.release();

    return {
      eligible: maxLoan > 0,
      limit: maxLoan,
      factors: {
        totalSavings,
        baseLimit,
        consistencyFactor,
        repaymentFactor
      },
      reason: maxLoan > 0 ? "Eligible" : "Calculated limit is 0"
    };

  } catch (error) {
    console.error("Eligibility Error:", error);
    throw error;
  }
};

const requestLoan = async (req, res) => {
  const { memberId, amount, re, duration } = req.body;
  
  if (!memberId || !amount || !duration) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1. Check Eligibility
    const eligibility = await calculateMaxLoan(memberId);
    
    if (!eligibility.eligible) {
      return res.status(403).json({ error: "Not eligible for loan", details: eligibility.reason });
    }

    if (amount > eligibility.limit) {
      return res.status(400).json({ 
        error: "Requested amount exceeds eligibility limit", 
        limit: eligibility.limit,
        details: eligibility.factors
      });
    }

    // 2. Prepare Loan Data
    const rate = 5; // Default from schema default or config
    // Simple interest for AmountToPay: P + (P * R * T / 12)?? 
    // Wait, typical formula. Assuming R is monthly or annual?
    // User schema says 'rate default 5'. Usually monthly in these systems (5%).
    // Let's assume 5% per month (common in informal groups) OR 5% annual.
    // Given the previous code `amount + (amount * rate * duration / 12)`, it treated '5' as 5% (0.05) if rate was passed as 0.05.
    // But schema stores `decimal(10,0)`. So stores '5'.
    // Use standard formula from Loans.tsx: `amount + (amount * (rate/100) * duration)`?
    // Let's stick to simple: amount * (1 + rate/100 * duration) or similar.
    // I will use `amountTopay` calculation similar to `Loans.tsx` implementation.
    // Loans.tsx: `rate = Number(newLoan.interestRate) / 100` -> 0.05
    // `amountTopay = amount + (amount * rate * duration / 12)` -> Annual rate logic?
    // If schema default is 5, it's likely 5%.
    
    const numericAmount = Number(amount);
    const amountTopay = numericAmount + (numericAmount * (rate / 100) * (duration / 12)); // Assuming annual rate logic from frontend

    const conn = await db.getConnection();
    const result = await conn.query(
      "INSERT INTO loan (memberId, amount, rate, duration, re, requestDate, amountTopay, status) VALUES (?, ?, ?, ?, ?, NOW(), ?, 'approved')",
      [memberId, numericAmount, rate, duration, re || 'Auto-Request', amountTopay]
    );
    conn.release();

    return res.json({ 
        success: true, 
        message: "Loan requested and approved automatically", 
        loanId: result[0].insertId,
        details: eligibility 
    });

  } catch (error) {
    console.error("Loan Request Error:", error);
    res.status(500).json({ error: "Internal processing error" });
  }
};

module.exports = {
  calculateMaxLoan,
  requestLoan
};
