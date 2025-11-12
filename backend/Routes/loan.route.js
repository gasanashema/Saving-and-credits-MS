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
} = require("../services/loan.service");
const loanRouter = express.Router();

loanRouter.post("/", addLoan);
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
module.exports = loanRouter;
