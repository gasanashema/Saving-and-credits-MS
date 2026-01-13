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
} = require("../services/loan.service");
const { requestLoan, calculateMaxLoan } = require("../services/autoLoan.service");
const loanRouter = express.Router();

loanRouter.post("/", addLoan);
loanRouter.get("/details/:id", getLoanById);
loanRouter.get("/:limit", getLoansByStatus);
loanRouter.get("/member/:memberId", getMemberLoans);
loanRouter.get("/data/:status/:start/:end", getAllLoans);
loanRouter.get("/actions/:loanId/:action", loanAction);
loanRouter.get("/total/:search", getTotal);
loanRouter.get("/payment-details/:loanId", getLoanPaymentDetails);
loanRouter.get("/payments/recent", getAllLoanPayments);
loanRouter.get("/member-payment-history/:memberId", getMemberPaymentHistory);
loanRouter.put("/pay", payLoan);
loanRouter.get("/payhistory/:id", getLoanHistory);

// Auto-Loan Routes
loanRouter.post("/auto", requestLoan);
loanRouter.get("/eligibility/:memberId", async (req, res) => {
  try {
    const result = await calculateMaxLoan(req.params.memberId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to check eligibility" });
  }
});
module.exports = loanRouter;
