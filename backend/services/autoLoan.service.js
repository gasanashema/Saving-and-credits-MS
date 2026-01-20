const db = require('../db/db');

// Helper: Calculate months difference
const getMonthDiff = (d1, d2) => {
  let months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
};

const calculateMaxLoan = async (memberId, packageId = null) => {
  try {
    const conn = await db.getConnection();
    
    // 1. Fetch Loan Package Config
    let packageRules = {
      min_savings: 0,
      min_membership_months: 0, // Default fallback (Relaxed to 0 for maximum ease)
      loan_multiplier: 3.0,     // Default fallback
      repayment_duration_months: 12,
      interest_rate: 5,
      name: 'Standard (Default)'
    };

    if (packageId) {
      const [pkgs] = await conn.query("SELECT * FROM loan_packages WHERE id = ?", [packageId]);
      if (pkgs.length > 0) {
        const p = pkgs[0];
        packageRules = {
          min_savings: Number(p.min_savings),
          min_membership_months: p.min_membership_months,
          loan_multiplier: Number(p.loan_multiplier),
          repayment_duration_months: p.repayment_duration_months,
          interest_rate: Number(p.interest_rate),
          name: p.name
        };
      }
    } else {
       // If no package selected, maybe pick the "Standard Loan" or highest multiplier to show potential?
       // For now, let's try to find a 'Standard Loan' or use defaults.
       const [pkgs] = await conn.query("SELECT * FROM loan_packages WHERE name LIKE '%Standard%' LIMIT 1");
       if (pkgs.length > 0) {
          const p = pkgs[0];
          packageRules = {
            min_savings: Number(p.min_savings),
            min_membership_months: p.min_membership_months,
            loan_multiplier: Number(p.loan_multiplier),
            repayment_duration_months: p.repayment_duration_months,
            interest_rate: Number(p.interest_rate),
            name: p.name
          };
       }
    }
    
    // 2. Check Membership Duration
    const [memberData] = await conn.query(
      "SELECT created_at, firstName, lastName FROM members WHERE id = ?",
      [memberId]
    );

    if (memberData.length === 0) {
       conn.release();
       return { eligible: false, limit: 0, reason: "Member not found." };
    }

    const joinDate = memberData[0].created_at ? new Date(memberData[0].created_at) : new Date();
    const membershipMonths = getMonthDiff(joinDate, new Date());
    
    if (membershipMonths < packageRules.min_membership_months) {
      conn.release();
      return { 
        eligible: false, 
        limit: 0, 
        reason: `Membership duration (${membershipMonths} months) is less than required minimum (${packageRules.min_membership_months} months) for ${packageRules.name}.` 
      };
    }

    // 3. Calculate Total Savings
    const [savings] = await conn.query(
      "SELECT SUM(numberOfShares * shareValue) as total FROM savings WHERE memberId = ?",
      [memberId]
    );
    const totalSavings = Number(savings[0].total || 0);
    
    if (totalSavings < packageRules.min_savings) {
      conn.release();
      return { 
        eligible: false, 
        limit: 0, 
        reason: `Total savings (${totalSavings}) is less than required minimum (${packageRules.min_savings}) for ${packageRules.name}.` 
      };
    }

    // 4. Calculate Factors
    let baseLimit = totalSavings * packageRules.loan_multiplier;
    
    // Ensure at least a small limit even if savings are low (Micro-loan logic)
    if (baseLimit < 50000) baseLimit = 50000; // Minimum floor for eligible members

    let consistencyFactor = 1.0;
    let repaymentFactor = 1.0;

    // Consistency: Check savings in last 6 months (hardcoded or config)
    const CONSISTENCY_CHECK_MONTHS = 6;
    const [consistency] = await conn.query(
      "SELECT COUNT(DISTINCT DATE_FORMAT(date, '%Y-%m')) as months_saved FROM savings WHERE memberId = ? AND date >= DATE_SUB(NOW(), INTERVAL ? MONTH)",
      [memberId, CONSISTENCY_CHECK_MONTHS]
    );
    const monthsSaved = consistency[0].months_saved || 0;
    
    // Relaxed consistency penalty
    if (monthsSaved < (CONSISTENCY_CHECK_MONTHS / 2)) {
      consistencyFactor = 0.9; // Was 0.8
    } else if (monthsSaved === 0) {
      consistencyFactor = 0.8; // Was 0.5
    }

    // Repayment: Check penalties
    const [penalties] = await conn.query(
        "SELECT COUNT(*) as count FROM penalties WHERE memberId = ? AND pstatus = 'wait'",
        [memberId]
    );
    if (penalties[0].count > 0) {
        repaymentFactor = 0.0; // Ineligible if active penalties
    }

    // Check early repayment bonus (simple implementation: if paid previous loans on time/early)
    // For now, let's keep repaymentFactor simple based on penalties as specific alg was not detailed beyond "Configurable/repayment data"
    // We can add a query to boost factor if they have existing PAID loans with no penalties.
    const [pastLoans] = await conn.query(
        "SELECT count(*) as count FROM loan WHERE memberId = ? AND status = 'paid'",
        [memberId]
    );
    if (pastLoans[0].count > 0 && repaymentFactor > 0) {
        repaymentFactor += 0.1; // 10% bonus for past good behavior
    }

    // Final Limit Calculation
    const maxLoan = Math.floor(baseLimit * consistencyFactor * repaymentFactor);

    // 5. Active Loan Rule: total_active_loans_amount + requested_loan <= max_allowed
    // We calculate "remaining capacity".
    // Get current active loans amount (principal)
    const [activeLoans] = await conn.query(
       "SELECT SUM(amount) as totalActive FROM loan WHERE memberId = ? AND status IN ('active', 'approved', 'pending')",
       [memberId]
    );
    const currentActiveAmount = Number(activeLoans[0].totalActive || 0);
    
    const remainingCapacity = Math.max(0, maxLoan - currentActiveAmount);

    // Log the calculation
    await conn.query(
      "INSERT INTO loan_eligibility_logs (member_id, total_savings, base_limit, consistency_factor, repayment_factor, final_limit, is_eligible) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [memberId, totalSavings, baseLimit, consistencyFactor, repaymentFactor, maxLoan, remainingCapacity > 0]
    );

    conn.release();

    return {
      eligible: remainingCapacity > 0,
      limit: remainingCapacity, // The user can only borrow what's left of their capacity
      maxTotalLimit: maxLoan,   // The total they could have if they had 0 loans
      currentActiveAmount,
      factors: {
        totalSavings,
        baseLimit,
        consistencyFactor,
        repaymentFactor,
        package: packageRules.name
      },
      packageRules,
      reason: remainingCapacity > 0 ? "Eligible" : `Credit limit reached. Total limit: ${maxLoan}, Active: ${currentActiveAmount}`
    };

  } catch (error) {
    console.error("Eligibility Error:", error);
    throw error;
  }
};

const requestLoan = async (req, res) => {
  const { memberId, amount, re, duration, packageId } = req.body;
  
  if (!memberId || !amount || !duration) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1. Check Eligibility
    const eligibility = await calculateMaxLoan(memberId, packageId);
    
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
    // Enforce rate from package if available
    let rate = 5;
    if (eligibility.packageRules && eligibility.packageRules.interest_rate !== undefined) {
        rate = eligibility.packageRules.interest_rate;
    }

    const numericAmount = Number(amount);
    // Formula: Principal + (Principal * (Rate/100) * (Duration/12)) - Annual Rate Logic
    const amountTopay = numericAmount + (numericAmount * (rate / 100) * (duration / 12));

    const conn = await db.getConnection();
    const result = await conn.query(
      "INSERT INTO loan (memberId, amount, rate, duration, re, requestDate, amountTopay, status, package_id) VALUES (?, ?, ?, ?, ?, NOW(), ?, 'pending', ?)",
      [memberId, numericAmount, rate, duration, re || 'Loan Request', amountTopay, packageId || null]
    );
    conn.release();

    return res.json({ 
        success: true, 
        message: "Loan request submitted for approval", 
        loanId: result[0].insertId,
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
