const express = require("express");
const {
  getTotal,
  addLoan,
  payLoan,
  getMemberLoans,
  getAllLoans,
  loanAction,
  getLoanHistory,
  getLoansByStatus,
  getLoanPaymentDetails,
  getAllLoanPayments,
  getMemberPaymentHistory,
  getLoanById,
  getLoanConfigs,
  updateLoanConfig,
} = require("../services/loan.service");
const {
  requestLoan,
  calculateMaxLoan,
} = require("../services/autoLoan.service");
const {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
} = require("../services/loan-package.service");
const {
  verifySuperAdmin,
  verifyAdmin,
  verifyToken,
} = require("../middleware/auth.middleware");

const loanRouter = express.Router();

// Loan Packages Routes (Place first to avoid conflict)
loanRouter.get("/packages/all", getAllPackages);
loanRouter.get("/packages/:id", async (req, res) => {
  try {
    const pkg = await getPackageById(req.params.id);
    if (!pkg) return res.status(404).json({ error: "Package not found" });
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch package" });
  }
});
loanRouter.post("/packages", verifySuperAdmin, createPackage);
loanRouter.put("/packages/:id", verifySuperAdmin, updatePackage);

// Loan Configs Routes (Place before generic params)
loanRouter.get("/configs", verifyAdmin, getLoanConfigs);
loanRouter.put("/configs/:key", verifySuperAdmin, updateLoanConfig);

// Auto-Loan / Eligibility Routes
loanRouter.post("/auto", requestLoan);
loanRouter.get("/eligibility/:memberId", async (req, res) => {
  try {
    const { packageId } = req.query;
    const result = await calculateMaxLoan(req.params.memberId, packageId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to check eligibility" });
  }
});

loanRouter.post("/", verifyToken, addLoan);
loanRouter.get("/details/:id", verifyToken, getLoanById);
loanRouter.get("/:limit", verifyAdmin, getLoansByStatus);
loanRouter.get("/member/:memberId", verifyToken, getMemberLoans);
loanRouter.get("/data/:status/:start/:end", verifyAdmin, getAllLoans);
loanRouter.get("/actions/:loanId/:action", verifyAdmin, loanAction);
loanRouter.get("/total/:search", verifyAdmin, getTotal);
loanRouter.get("/payment-details/:loanId", verifyToken, getLoanPaymentDetails);
loanRouter.get("/payments/recent", verifyAdmin, getAllLoanPayments);
loanRouter.get(
  "/member-payment-history/:memberId",
  verifyToken,
  getMemberPaymentHistory,
);
loanRouter.put("/pay", verifyAdmin, payLoan);
loanRouter.get("/payhistory/:id", verifyToken, getLoanHistory);

module.exports = loanRouter;
