const conn = require("../db/connection");

const getAllPackages = async (req, res) => {
  try {
    const [packages] = await conn.query("SELECT * FROM loan_packages WHERE status='active'");
    return res.json(packages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch loan packages" });
  }
};

const getPackageById = async (id) => {
  const [packages] = await conn.query("SELECT * FROM loan_packages WHERE id = ?", [id]);
  return packages[0];
};

const createPackage = async (req, res) => {
  try {
    const { name, min_savings, min_membership_months, loan_multiplier, repayment_duration_months, interest_rate, description } = req.body;
    
    // Basic validation
    if (!name || !min_savings || !loan_multiplier) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const [result] = await conn.query(
      "INSERT INTO loan_packages (name, min_savings, min_membership_months, loan_multiplier, repayment_duration_months, interest_rate, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, min_savings, min_membership_months, loan_multiplier, repayment_duration_months, interest_rate, description]
    );

    return res.status(201).json({ message: "Package created", id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: "Package name already exists" });
    }
    console.error(error);
    return res.status(500).json({ error: "Failed to create package" });
  }
};

const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, min_savings, min_membership_months, loan_multiplier, repayment_duration_months, interest_rate, description, status } = req.body;
    
    await conn.query(
      "UPDATE loan_packages SET name=?, min_savings=?, min_membership_months=?, loan_multiplier=?, repayment_duration_months=?, interest_rate=?, description=?, status=? WHERE id=?",
      [name, min_savings, min_membership_months, loan_multiplier, repayment_duration_months, interest_rate, description, status, id]
    );

    return res.json({ message: "Package updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update package" });
  }
};

module.exports = {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage
};
