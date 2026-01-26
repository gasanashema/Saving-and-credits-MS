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
      min_membership_months: 0, 
      max_loan_amount: 10000000,
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
          max_loan_amount: Number(p.max_loan_amount || 0),
          repayment_duration_months: p.repayment_duration_months,
          interest_rate: Number(p.interest_rate),
          name: p.name
        };
      }
    } else {
       // Fallback: try to find a standard package
       const [pkgs] = await conn.query("SELECT * FROM loan_packages WHERE name LIKE '%Standard%' LIMIT 1");
       if (pkgs.length > 0) {
          const p = pkgs[0];
          packageRules = {
            min_savings: Number(p.min_savings),
            min_membership_months: p.min_membership_months,
            max_loan_amount: Number(p.max_loan_amount || 0),
            repayment_duration_months: p.repayment_duration_months,
            interest_rate: Number(p.interest_rate),
            name: p.name
          };
       }
    }
    
    // 2. ONE ACTIVE LOAN POLICY
    // Check if user has ANY active, pending, or approved loan
    const [existingLoans] = await conn.query(
        "SELECT count(*) as count FROM loan WHERE memberId = ? AND status IN ('active', 'pending', 'approved')",
        [memberId]
    );
    
    if (existingLoans[0].count > 0) {
        conn.release();
        return {
            eligible: false,
            // currentActiveAmount uses "count" conceptually here as a blocker
            limit: 0,
            reason: "You have an active or pending loan. You must repay it before applying for a new one."
        };
    }

    // 3. CHECK MEMBERSHIP DURATION
    const [memberData] = await conn.query(
      "SELECT created_at FROM members WHERE id = ?",
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

    // 4. CHECK TOTAL SAVINGS
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

    // 5. DETERMINE LIMIT
    // The limit is simply the package's max loan amount.
    let baseLimit = 10000000; // Default
    if (packageRules.max_loan_amount && packageRules.max_loan_amount > 0) {
       baseLimit = packageRules.max_loan_amount;
    }
    
    // Always eligible if checks passed
    conn.release();

    return {
      eligible: true,
      limit: baseLimit, 
      maxTotalLimit: baseLimit,
      currentActiveAmount: 0,
      factors: {
        totalSavings,
        baseLimit,
        package: packageRules.name
      },
      packageRules,
      reason: "Eligible"
    };

  } catch (error) {
    console.error("Eligibility Error:", error);
    throw error;
  }
};

const jwt = require("jsonwebtoken");

const requestLoan = async (req, res) => {
  let { memberId, amount, re, duration, packageId } = req.body;
  
  // Try to get memberId from token if not in body
  if (!memberId) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
          try {
            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            memberId = decoded.id;
          } catch (e) {
             console.warn("Token decode failed in requestLoan", e);
          }
      }
  }

  console.log("Loan Request Received:", { memberId, amount, duration, packageId });

  if (!memberId || !amount || !duration) {
    console.error("Missing required fields:", { memberId, amount, duration });
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1. Check Eligibility
    const eligibility = await calculateMaxLoan(memberId, packageId);
    console.log("Eligibility Check Result:", JSON.stringify(eligibility, null, 2));
    
    if (!eligibility.eligible) {
      console.error("Loan Eligibility Failed:", eligibility.reason);
      return res.status(403).json({ error: "Not eligible for loan", details: eligibility.reason });
    }

    if (amount > eligibility.limit) {
      console.error(`Amount Exceeds Limit: Requested ${amount}, Limit ${eligibility.limit}`);
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
